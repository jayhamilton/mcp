/**
 * Development Agent
 *
 * Takes a GitHub issue number (status:ready-for-dev or status:dev-rework) and:
 *   1. Reads the issue via GitHub MCP server
 *   2. Reads source files via filesystem MCP server
 *   3. Writes spec to .work/specs/SPEC-<issue>.md (filesystem MCP)
 *   4. Implements the changes (filesystem MCP)
 *   5. Posts impl summary as GitHub issue comment (GitHub MCP)
 *   6. Writes impl summary to .work/implementations/IMPL-<issue>.md (filesystem MCP)
 *   7. Sets status to ready-for-qa (custom tool)
 *
 * Usage:
 *   node agents/dev-agent.js <issue-number>
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
  return `You are a spec-driven Development Agent working on the GitHub repo "${repo}".

All GitHub tool calls require owner="${owner}" and repo="${repoName}".

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
Call get_issue with issue_number=${issueNumber}.
Then call get_issue comments via list the issue to check for existing comments.
If status is dev-rework, read comments to find the QA failure details.

### Step 1.5: Mark the issue as in-progress
Call set_issue_status with issue_number=${issueNumber} and status="in-dev".
Do this immediately after reading the issue, before any file work.

### Step 2: Read relevant source files
Use read_file on source files you need to understand before coding.

### Step 3: Write the spec BEFORE touching source code
Write .work/specs/SPEC-${issueNumber}.md using write_file.

Spec format:
# Spec: <story title>
**Issue**: #${issueNumber}
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
Use write_file or edit_file to modify source files.
- Make only the changes described in the spec
- Do not refactor surrounding code
- Implement exactly what the acceptance criteria require — nothing more

### Step 5: Post implementation summary as a GitHub comment
Call add_issue_comment on issue ${issueNumber} with this body:

## Implementation Summary
**Spec**: .work/specs/SPEC-${issueNumber}.md

### Changes Made
- <file>: <what changed>

### Acceptance Criteria Coverage
- [ ] <criterion>: <how it was implemented>

### QA Notes
<Anything QA should specifically verify>

### Step 6: Write implementation summary to file
Write the same content to .work/implementations/IMPL-${issueNumber}.md

### Step 6.5: Commit all changes
Call git_commit with a message in the format:
  feat: implement #${issueNumber} - <story title in imperative form>

This commits the spec, all modified source files, and the implementation summary together.

### Step 7: Update the issue status
Call set_issue_status with issue_number=${issueNumber} and status="ready-for-qa"

## Rules
- Never skip the spec step — write the spec file before any source file changes
- Only implement what the story and acceptance criteria describe
- If this is a dev-rework, address the specific QA failures found in the comments`;
};

async function run(issueNumber) {
  const anthropic = new Anthropic();
  const repo = getRepo();

  console.log(`[Dev Agent] Connecting to MCP servers for issue #${issueNumber}...`);
  const [githubClient, fsClient] = await Promise.all([
    createGitHubClient(),
    createFilesystemClient(ROOT)
  ]);

  try {
    const [{ tools: ghTools }, { tools: fsTools }] = await Promise.all([
      githubClient.listTools(),
      fsClient.listTools()
    ]);

    const allowedGhTools  = ['get_issue', 'list_issues', 'add_issue_comment'];
    const allowedFsTools  = ['read_file', 'write_file', 'edit_file', 'list_directory', 'create_directory'];

    const allTools = [
      ...toAnthropicTools(ghTools.filter(t => allowedGhTools.includes(t.name))),
      ...toAnthropicTools(fsTools.filter(t => allowedFsTools.includes(t.name))),
        customDefs.find(t => t.name === 'git_commit'),
      customDefs.find(t => t.name === 'set_issue_status')
    ].filter(Boolean);

    const ghToolNames = new Set(ghTools.map(t => t.name));
    const customToolNames = new Set(customDefs.map(t => t.name));

    async function handleToolCall(name, input) {
      if (customToolNames.has(name)) return customHandler(name, input);
      if (ghToolNames.has(name))    return callTool(githubClient, name, input);
      return callTool(fsClient, name, input);
    }

    console.log(`[Dev Agent] Processing issue #${issueNumber}...\n`);

    const result = await runAgent({
      client: anthropic,
      systemPrompt: SYSTEM_PROMPT(repo, issueNumber),
      userMessage: `Implement the story in GitHub issue #${issueNumber}.`,
      tools: allTools,
      handleToolCall
    });

    console.log('\n[Dev Agent] Complete.\n');
    console.log(result);
    return result;

  } finally {
    await Promise.all([githubClient.close(), fsClient.close()]);
  }
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
