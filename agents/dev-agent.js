/**
 * Development Agent
 *
 * Takes a GitHub issue number (story with status:ready-for-dev or status:dev-rework) and:
 *   1. Reads the issue body (acceptance criteria, technical notes)
 *   2. Reads relevant source files
 *   3. Writes a spec to .work/specs/SPEC-<issue>.md BEFORE touching source code
 *   4. Implements the changes
 *   5. Posts an implementation summary as a GitHub issue comment
 *   6. Writes implementation summary to .work/implementations/IMPL-<issue>.md
 *   7. Sets issue status to ready-for-qa
 *
 * Usage:
 *   node agents/dev-agent.js <issue-number>
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

const SYSTEM_PROMPT = `You are a spec-driven Development Agent. You implement software changes for a static HTML/JavaScript learning module.

## Project structure
- index.html — shell, loads scripts and navigation
- src/css/styles.css — all styling
- src/js/app.js — entry point, imports modules
- src/js/modules/navigation.js — section switching, progress bar
- src/js/modules/content-loader.js — renders section content
- src/js/modules/quiz.js — quiz logic
- src/js/modules/ace-editor.js — code editor integration
- src/js/modules/animation-*.js — GSAP animations per section

## Your process — follow this order exactly

### Step 1: Read the GitHub issue
Call github_get_issue with the issue number provided.
If the issue has existing comments, call github_list_comments to read them
(for dev-rework stories, the QA test result comment will be there).

### Step 2: Read relevant source files
Use read_file on any source files you will need to understand before coding.

### Step 3: Write the spec BEFORE touching source code
Write .work/specs/SPEC-<issue-number>.md

Spec format:
# Spec: <story title>
**Issue**: #<number>
**Date**: <today>

## Approach
<Implementation approach in plain English>

## Files to Change
- <file path>: <what will change and why>

## Files NOT to Change
- <file path>: <why it is out of scope>

## Risks / Assumptions
- <anything uncertain that QA should verify>

### Step 4: Implement the changes
- Make only the changes described in the spec
- Do not refactor surrounding code
- Do not add comments or documentation unless the story requires it
- Implement exactly what the acceptance criteria require — nothing more

### Step 5: Post implementation summary as a GitHub comment
Call github_add_comment on the issue with this format:

## Implementation Summary
**Spec**: .work/specs/SPEC-<issue-number>.md

### Changes Made
- <file>: <what changed>

### Acceptance Criteria Coverage
- [ ] <criterion>: <how it was implemented>

### QA Notes
<Anything QA should specifically verify>

### Step 6: Write implementation summary to file
Write the same content to .work/implementations/IMPL-<issue-number>.md

### Step 7: Update the issue status
Call github_set_status with number=<issue-number> and status="ready-for-qa"

## Rules
- Never skip the spec step
- Only implement what the story and acceptance criteria describe
- If it is a dev-rework issue, read the QA failure comment first and address those failures
- The spec file uses the GitHub issue number, not a sequential ID`;

async function run(issueNumber) {
  const client = new Anthropic();
  console.log(`[Dev Agent] Processing issue #${issueNumber}...\n`);

  const result = await runAgent({
    client,
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `Implement the story in GitHub issue #${issueNumber}.`,
    tools: allTools,
    handleToolCall
  });

  console.log('\n[Dev Agent] Complete.\n');
  console.log(result);
  return result;
}

if (require.main === module) {
  const issueNumber = parseInt(process.argv[2], 10);
  if (!issueNumber) {
    console.error('Usage: node agents/dev-agent.js <issue-number>');
    process.exit(1);
  }
  run(issueNumber).catch(err => {
    console.error('[Dev Agent] Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { run };
