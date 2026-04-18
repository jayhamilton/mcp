/**
 * Documentation Agent
 *
 * Takes a GitHub issue number (story with status:ready-for-docs) and:
 *   1. Reads the issue body and all comments (impl summary, QA result)
 *   2. Reads the changed source files for current state
 *   3. Writes developer documentation to .work/docs/DOC-<issue>.md
 *   4. Posts the documentation as a GitHub issue comment
 *   5. Sets issue status to done and closes the issue
 *
 * Usage:
 *   node agents/docs-agent.js <issue-number>
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

const SYSTEM_PROMPT = `You are a Documentation Agent. You produce clear, accurate developer documentation for a completed feature.

## Your process — follow this order exactly

### Step 1: Gather context
- Call github_get_issue with the issue number
- Call github_list_comments to get the Implementation Summary and QA Results comments
- Read the spec: .work/specs/SPEC-<issue-number>.md
- Read each source file listed in the Implementation Summary's "Changes Made" section

### Step 2: Write documentation to file
Write .work/docs/DOC-<issue-number>.md

Format:
# <Feature Title>
**Issue**: #<number>
**Date**: <today>

## Overview
<2-3 sentences: what was added or changed and why>

## What Changed
| File | Change |
|------|--------|
| <file> | <what changed> |

## How It Works
<Explain the implementation clearly enough that another developer could maintain it.
Include actual code snippets from the source files — not invented examples.>

## Usage
<If user-facing: how a user interacts with it.
If developer-facing: API, function signatures, or configuration.>

## Known Limitations
<Anything from QA notes or spec risks that was deferred.
Write NONE if there are no known limitations.>

## Related Files
- <file path> — <one-line description of its role>

### Step 3: Post the documentation as a GitHub comment
Call github_add_comment with the same documentation content, prefixed with:

## Documentation

<rest of doc content>

### Step 4: Close the issue
- Call github_set_status with status="done"
- Call github_close_issue

## Rules
- Document what the code actually does — read the source, do not invent
- Code snippets must come from the actual implementation files you read
- A developer should understand the change in under 3 minutes
- Known Limitations must be honest — do not omit deferred bugs or gaps
- Do not repeat information obvious from the file name or function name`;

async function run(issueNumber) {
  const client = new Anthropic();
  console.log(`[Docs Agent] Documenting issue #${issueNumber}...\n`);

  const result = await runAgent({
    client,
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `Document the completed feature in GitHub issue #${issueNumber}.`,
    tools: allTools,
    handleToolCall
  });

  console.log('\n[Docs Agent] Complete.\n');
  console.log(result);
  return result;
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
