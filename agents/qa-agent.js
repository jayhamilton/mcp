/**
 * QA Agent
 *
 * Takes a GitHub issue number (status:ready-for-qa) and:
 *   1. Reads the issue + comments via GitHub MCP server
 *   2. Reads spec and changed source files via filesystem MCP server
 *   3. Writes test plan to .work/test-plans/TESTPLAN-<issue>.md
 *   4. Evaluates test cases against the actual source code
 *   5. Writes results to .work/test-results/RESULT-<issue>.md
 *   6. Posts results as a GitHub issue comment
 *   7. Sets status: ready-for-docs (pass) or dev-rework (fail)
 *
 * Usage:
 *   node agents/qa-agent.js <issue-number>
 *
 * Required env: GITHUB_TOKEN
 */

'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { createGitHubClient, createFilesystemClient, toAnthropicTools, callTool } = require('./lib/mcp-client');
const { toolDefinitions: customDefs, handleToolCall: customHandler } = require('./lib/custom-tools');
const { runAgent } = require('./lib/agent-runner');
const { getRepo } = require('./lib/github');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const SYSTEM_PROMPT = (repo, issueNumber) => {
  const [owner, repoName] = repo.split('/');
  return `You are a QA Agent for the GitHub repo "${repo}".

All GitHub tool calls require owner="${owner}" and repo="${repoName}".

## Your process — follow this order exactly

### Step 1: Gather context
- Call get_issue with issue_number=${issueNumber} to read the story and acceptance criteria
- Call search_issues or look at comments to find the Implementation Summary comment
  (use: search_issues with query "repo:${repo} is:issue ${issueNumber} in:comments Implementation Summary")
- Read .work/specs/SPEC-${issueNumber}.md using read_file
- Read .work/implementations/IMPL-${issueNumber}.md using read_file
- Read each source file listed in the IMPL's "Changes Made" section using read_file

### Step 2: Write the test plan
Write .work/test-plans/TESTPLAN-${issueNumber}.md using write_file.

Format:
# Test Plan: <story title>
**Issue**: #${issueNumber}
**Date**: <today>

## Test Cases

### TC-001: <Acceptance criterion being tested>
**Type**: code-review | functional | visual
**Steps**: 1. <step> 2. <step>
**Expected**: <what should happen>
**Pass Criteria**: <exact observable condition>

(one test case per acceptance criterion minimum)

### Step 3: Evaluate each test case
Read the source files and verify the implementation.
For code-review tests: verify directly from source code.
For functional/visual tests: describe what a human tester must verify.

### Step 4: Write test results
Write .work/test-results/RESULT-${issueNumber}.md using write_file.

Format:
# Test Results: <story title>
**Issue**: #${issueNumber}
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
- BUG-001: <description, file, line> (or NONE)

### Step 5: Post results as a GitHub comment
Call add_issue_comment on issue ${issueNumber}:

## QA Results — [PASS | FAIL]

| Test | Status | Evidence |
|------|--------|----------|
| TC-001: <title> | PASS/FAIL | <brief> |

**Summary**: Total N | Passed N | Failed N

**Bugs Found**: <list or NONE>

**Next**: All passed — moving to documentation. OR Failed — returning to dev. Issues: <list>

### Step 6: Update the issue status
Call set_issue_status:
- All pass → status="ready-for-docs"
- Any fail → status="dev-rework"

## Rules
- PASS requires positive evidence in the code, not just absence of failure
- Do not fail criteria for issues outside the story's scope
- Be specific: name the file and what you observed`;
};

async function run(issueNumber) {
  const anthropic = new Anthropic();
  const repo = getRepo();

  console.log(`[QA Agent] Connecting to MCP servers for issue #${issueNumber}...`);
  const [githubClient, fsClient] = await Promise.all([
    createGitHubClient(),
    createFilesystemClient(ROOT)
  ]);

  try {
    const [{ tools: ghTools }, { tools: fsTools }] = await Promise.all([
      githubClient.listTools(),
      fsClient.listTools()
    ]);

    const allowedGhTools = ['get_issue', 'add_issue_comment', 'search_issues'];
    const allowedFsTools = ['read_file', 'write_file', 'list_directory'];

    const allTools = [
      ...toAnthropicTools(ghTools.filter(t => allowedGhTools.includes(t.name))),
      ...toAnthropicTools(fsTools.filter(t => allowedFsTools.includes(t.name))),
      customDefs.find(t => t.name === 'set_issue_status')
    ].filter(Boolean);

    const ghToolNames  = new Set(ghTools.map(t => t.name));
    const customToolNames = new Set(customDefs.map(t => t.name));

    async function handleToolCall(name, input) {
      if (customToolNames.has(name)) return customHandler(name, input);
      if (ghToolNames.has(name))    return callTool(githubClient, name, input);
      return callTool(fsClient, name, input);
    }

    console.log(`[QA Agent] Testing issue #${issueNumber}...\n`);

    const result = await runAgent({
      client: anthropic,
      systemPrompt: SYSTEM_PROMPT(repo, issueNumber),
      userMessage: `Test the implementation for GitHub issue #${issueNumber}.`,
      tools: allTools,
      handleToolCall
    });

    console.log('\n[QA Agent] Complete.\n');
    console.log(result);
    return result;

  } finally {
    await Promise.all([githubClient.close(), fsClient.close()]);
  }
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
