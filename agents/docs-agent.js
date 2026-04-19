/**
 * Documentation Agent
 *
 * Takes a GitHub issue number (status:ready-for-docs) and:
 *   1. Reads issue + comments via GitHub MCP server
 *   2. Reads changed source files via filesystem MCP server
 *   3. Writes documentation to .work/docs/DOC-<issue>.md
 *   4. Posts documentation as a GitHub issue comment
 *   5. Sets status to done and closes the issue
 *
 * Usage:
 *   node agents/docs-agent.js <issue-number>
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
  return `You are a Documentation Agent for the GitHub repo "${repo}".

All GitHub tool calls require owner="${owner}" and repo="${repoName}".

## Your process — follow this order exactly

### Step 1: Gather context
- Call get_issue with issue_number=${issueNumber} to read the story
- Read the issue comments to find the Implementation Summary and QA Results comments
  (use search_issues with query "repo:${repo} is:issue ${issueNumber}")
- Read .work/specs/SPEC-${issueNumber}.md using read_file
- Read .work/implementations/IMPL-${issueNumber}.md using read_file
- Read .work/test-results/RESULT-${issueNumber}.md using read_file
- Read each source file listed in the IMPL's "Changes Made" section

### Step 1.5: Mark the issue as in-progress
Call set_issue_status with issue_number=${issueNumber} and status="in-docs".
Do this immediately after gathering context, before writing documentation.

### Step 2: Write documentation to file
Write .work/docs/DOC-${issueNumber}.md using write_file.

Format:
# <Feature Title>
**Issue**: #${issueNumber}
**Date**: <today>

## Overview
<2-3 sentences: what was added/changed and why>

## What Changed
| File | Change |
|------|--------|
| <file> | <what changed> |

## How It Works
<Explain clearly enough that another developer can maintain it.
Use actual code snippets from the source files — not invented examples.>

## Usage
<If user-facing: how a user interacts with it.
If developer-facing: API, function signatures, configuration.>

## Known Limitations
<Deferred items from QA notes or spec risks. Write NONE if clean.>

## Related Files
- <file path> — <one-line role description>

### Step 3: Post the documentation as a GitHub comment
Call add_issue_comment on issue ${issueNumber} with the same content, prefixed with:

## Documentation

<rest of doc>

### Step 3.5: Commit documentation
Call git_commit with a message in the format:
  docs: complete story #${issueNumber} - <story title>

This commits the documentation file and signals that the full story (dev + QA + docs) is finished.

### Step 4: Close the issue
- Call set_issue_status with status="done"
- Call update_issue with state="closed" and state_reason="completed"

## Rules
- Document what the code actually does — read source, do not invent
- Code snippets must come from the actual source files you read
- A developer should understand the change in under 3 minutes
- Known Limitations must be honest`;
};

async function run(issueNumber) {
  const anthropic = new Anthropic();
  const repo = getRepo();

  console.log(`[Docs Agent] Connecting to MCP servers for issue #${issueNumber}...`);
  const [githubClient, fsClient] = await Promise.all([
    createGitHubClient(),
    createFilesystemClient(ROOT)
  ]);

  try {
    const [{ tools: ghTools }, { tools: fsTools }] = await Promise.all([
      githubClient.listTools(),
      fsClient.listTools()
    ]);

    const allowedGhTools = ['get_issue', 'update_issue', 'add_issue_comment', 'search_issues'];
    const allowedFsTools = ['read_file', 'write_file', 'list_directory'];

    const allTools = [
      ...toAnthropicTools(ghTools.filter(t => allowedGhTools.includes(t.name))),
      ...toAnthropicTools(fsTools.filter(t => allowedFsTools.includes(t.name))),
      customDefs.find(t => t.name === 'git_commit'),
      customDefs.find(t => t.name === 'set_issue_status')
    ].filter(Boolean);

    const ghToolNames  = new Set(ghTools.map(t => t.name));
    const customToolNames = new Set(customDefs.map(t => t.name));

    async function handleToolCall(name, input) {
      if (customToolNames.has(name)) return customHandler(name, input);
      if (ghToolNames.has(name))    return callTool(githubClient, name, input);
      return callTool(fsClient, name, input);
    }

    console.log(`[Docs Agent] Documenting issue #${issueNumber}...\n`);

    const result = await runAgent({
      client: anthropic,
      systemPrompt: SYSTEM_PROMPT(repo, issueNumber),
      userMessage: `Document the completed feature in GitHub issue #${issueNumber}.`,
      tools: allTools,
      handleToolCall
    });

    console.log('\n[Docs Agent] Complete.\n');
    console.log(result);
    return result;

  } finally {
    await Promise.all([githubClient.close(), fsClient.close()]);
  }
}

if (require.main === module) {
  const issueNumber = parseInt(process.argv[2], 10);
  if (!issueNumber) {
    console.error('Usage: node agents/docs-agent.js <issue-number>');
    process.exit(1);
  }
  run(issueNumber).catch(err => {
    console.error('[Docs Agent] Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { run };
