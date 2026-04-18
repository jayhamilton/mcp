/**
 * Product Owner Agent
 *
 * Accepts a change request and produces:
 *   - A GitHub Milestone (epic)     via custom tool (not in GitHub MCP server)
 *   - GitHub Issues (stories)       via GitHub MCP server
 *
 * Usage:
 *   node agents/po-agent.js "Add dark mode to the learning module"
 *   node agents/po-agent.js --file .work/requests/my-request.md
 *
 * Required env: GITHUB_TOKEN
 */

'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const { createGitHubClient, toAnthropicTools, callTool } = require('./lib/mcp-client');
const { toolDefinitions: customDefs, handleToolCall: customHandler } = require('./lib/custom-tools');
const { runAgent } = require('./lib/agent-runner');
const { bootstrapLabels, getRepo } = require('./lib/github');

const SYSTEM_PROMPT = (repo) => {
  const [owner, repoName] = repo.split('/');
  return `You are a Product Owner agent for the GitHub repo "${repo}".

All GitHub tool calls require owner="${owner}" and repo="${repoName}".

## Your process

### Step 1: List existing milestones
Call list_milestones to see existing epics and avoid duplicating them.

### Step 2: Create the milestone (epic)
Call create_milestone with:
- title: concise, under 60 chars
- description: one paragraph on what this epic achieves and why it matters

### Step 3: Create story issues
For each discrete deliverable, call create_issue. Each issue must have:

**title**: concise, under 60 chars

**body** (markdown):
## Story
As a <role>, I want <capability> so that <benefit>.

## Acceptance Criteria
- [ ] <specific, testable criterion>
- [ ] <specific, testable criterion>

## Technical Notes
<Implementation hints: files likely affected, approach constraints>

## Out of Scope
- <explicit exclusions>

**labels**: always include ALL of these:
- type:story
- status:ready-for-dev
- priority:high OR priority:medium OR priority:low

**milestone**: the milestone number returned from create_milestone

## Story rules
- Each story must be independently deliverable
- Acceptance criteria must be verifiable by reading or running code
- Prefer smaller stories over large ones`;
};

async function run(changeRequest) {
  const anthropic = new Anthropic();
  const repo = getRepo();

  console.log('[PO Agent] Bootstrapping GitHub labels...');
  await bootstrapLabels();

  console.log('[PO Agent] Connecting to GitHub MCP server...');
  const githubClient = await createGitHubClient();

  try {
    const { tools: ghTools } = await githubClient.listTools();
    // Only expose the tools the PO agent needs
    const allowedGhTools = ['create_issue', 'list_issues'];
    const filteredGhTools = ghTools.filter(t => allowedGhTools.includes(t.name));

    const allTools = [
      ...toAnthropicTools(filteredGhTools),
      ...customDefs
    ];

    const customToolNames = new Set(customDefs.map(t => t.name));

    async function handleToolCall(name, input) {
      if (customToolNames.has(name)) return customHandler(name, input);
      return callTool(githubClient, name, input);
    }

    console.log('[PO Agent] Processing change request...\n');

    const result = await runAgent({
      client: anthropic,
      systemPrompt: SYSTEM_PROMPT(repo),
      userMessage: `Process this change request and create a milestone and story issues:\n\n${changeRequest}`,
      tools: allTools,
      handleToolCall
    });

    console.log('\n[PO Agent] Complete.\n');
    console.log(result);
    return result;

  } finally {
    await githubClient.close();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let request;

  if (args[0] === '--file') {
    const filePath = args[1];
    if (!filePath || !fs.existsSync(filePath)) {
      console.error('ERROR: File not found:', filePath);
      process.exit(1);
    }
    request = fs.readFileSync(filePath, 'utf8');
  } else {
    request = args.join(' ');
  }

  if (!request || !request.trim()) {
    console.error('Usage:');
    console.error('  node agents/po-agent.js "<change request>"');
    console.error('  node agents/po-agent.js --file .work/requests/request.md');
    process.exit(1);
  }

  run(request).catch(err => {
    console.error('[PO Agent] Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { run };
