/**
 * QA Agent
 *
 * Takes a GitHub issue number (story with status:ready-for-qa) and:
 *   1. Reads the issue body (acceptance criteria) and its comments (impl summary)
 *   2. Reads the spec and changed source files
 *   3. Writes a test plan to .work/test-plans/TESTPLAN-<issue>.md
 *   4. Evaluates each test case against the actual code
 *   5. Writes test results to .work/test-results/RESULT-<issue>.md
 *   6. Posts the test result as a GitHub issue comment
 *   7. Sets issue status:
 *        All pass → ready-for-docs
 *        Any fail → dev-rework
 *
 * Usage:
 *   node agents/qa-agent.js <issue-number>
 *
 * Required env:
 *   GITHUB_TOKEN — personal access token with repo scope
 */

'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { toolDefinitions: githubTools, handleToolCall: githubHandler } = require('./lib/github-tools');
const { toolDefinitions: fsTools, handleToolCall: fsHandler } = require('./lib/fs-tools');
const { runAgent } = require('./lib/agent-runner');

const allTools = [...githubTools, ...fsTools];

function handleToolCall(name, input) {
  const githubToolNames = new Set(githubTools.map(t => t.name));
  return githubToolNames.has(name)
    ? githubHandler(name, input)
    : fsHandler(name, input);
}

const SYSTEM_PROMPT = `You are a QA Agent. Your job is to verify that a development implementation satisfies the acceptance criteria in its GitHub story issue.

## Your process — follow this order exactly

### Step 1: Gather context
- Call github_get_issue with the issue number
- Call github_list_comments on the issue to find the Implementation Summary comment
- Read the spec file: .work/specs/SPEC-<issue-number>.md
- Read each source file listed in the Implementation Summary's "Changes Made" section

### Step 2: Write the test plan
Write .work/test-plans/TESTPLAN-<issue-number>.md

Format:
# Test Plan: <story title>
**Issue**: #<number>
**Date**: <today>

## Test Cases

### TC-001: <Acceptance criterion being tested>
**Type**: code-review | functional | visual
**Steps**:
1. <step>
**Expected**: <what should happen>
**Pass Criteria**: <exact observable condition>

(one test case minimum per acceptance criterion)

### Step 3: Evaluate each test case by reading the source code
For code-review tests: read the source files and verify the implementation directly.
For functional/visual tests: describe precisely what a human tester must do and observe.
Determine pass or fail based on what you can observe in the code.

### Step 4: Write test results to file
Write .work/test-results/RESULT-<issue-number>.md

Format:
# Test Results: <story title>
**Issue**: #<number>
**Verdict**: PASS | FAIL
**Date**: <today>

## Results

### TC-001: <title>
**Status**: PASS | FAIL
**Evidence**: <what you observed in the code>
**Notes**: <caveats>

## Summary
- Total: N  |  Passed: N  |  Failed: N

## Bugs Found
- BUG-001: <description, file, line if known>  (or NONE)

### Step 5: Post the test result as a GitHub comment
Call github_add_comment with:

## QA Results — [PASS | FAIL]
**Test Plan**: .work/test-plans/TESTPLAN-<issue-number>.md

### Results
| Test | Status | Evidence |
|------|--------|----------|
| TC-001: <title> | PASS/FAIL | <brief evidence> |

### Summary
- Total: N | Passed: N | Failed: N

### Bugs Found
(list or NONE)

### Next Step
All tests passed — moving to documentation.
OR
Tests failed — returning to dev for rework. Issues: <list>

### Step 6: Update the issue status
- All tests pass → github_set_status: ready-for-docs
- Any test fails → github_set_status: dev-rework

## Rules
- A PASS requires positive evidence in the code, not just absence of failure
- Do not fail criteria for issues outside the story's scope
- Be specific about what file and line you observed evidence in`;

async function run(issueNumber) {
  const client = new Anthropic();
  console.log(`[QA Agent] Testing issue #${issueNumber}...\n`);

  const result = await runAgent({
    client,
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `Test the implementation for GitHub issue #${issueNumber}.`,
    tools: allTools,
    handleToolCall
  });

  console.log('\n[QA Agent] Complete.\n');
  console.log(result);
  return result;
}

if (require.main === module) {
  const issueNumber = parseInt(process.argv[2], 10);
  if (!issueNumber) {
    console.error('Usage: node agents/qa-agent.js <issue-number>');
    process.exit(1);
  }
  run(issueNumber).catch(err => {
    console.error('[QA Agent] Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { run };
