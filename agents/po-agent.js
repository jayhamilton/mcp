/**
 * Product Owner Agent
 *
 * Accepts a change request and produces:
 *   - A GitHub Milestone (epic)
 *   - One or more GitHub Issues (stories) linked to the milestone
 *     with label: type:story, status:ready-for-dev, priority:*
 *
 * Usage:
 *   node agents/po-agent.js "Add dark mode to the learning module"
 *   node agents/po-agent.js --file .work/requests/my-request.md
 *
 * Required env:
 *   GITHUB_TOKEN — personal access token with repo scope
 */

'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const { toolDefinitions, handleToolCall } = require('./lib/github-tools');
const { runAgent } = require('./lib/agent-runner');
const { bootstrapLabels } = require('./lib/github');

const SYSTEM_PROMPT = `You are a Product Owner agent. You take a change request and create GitHub issues (stories) grouped under a GitHub milestone (epic).

## Your process

### Step 1: List existing milestones
Call github_list_milestones to see what epics already exist and avoid duplicating them.

### Step 2: Create the milestone (epic)
Call github_create_milestone with:
- title: short, descriptive (under 60 chars)
- description: one paragraph on what this epic achieves and why

### Step 3: Create story issues
Call github_create_issue for each discrete deliverable. Each issue must have:

**Title**: concise (under 60 chars)

**Body** (markdown):
## Story
As a <role>, I want <capability> so that <benefit>.

## Acceptance Criteria
- [ ] <specific, testable criterion>
- [ ] <specific, testable criterion>

## Technical Notes
<Implementation hints: files likely affected, approach constraints>

## Out of Scope
- <explicit exclusions>

**Labels**: always include ALL of these:
- type:story
- status:ready-for-dev
- priority:high OR priority:medium OR priority:low

**milestone_number**: the number returned from the milestone you just created

## Story rules
- Each story must be independently deliverable
- Acceptance criteria must be verifiable by reading or running code
- Prefer smaller stories over large ones
- Do not create stories for things outside the request's scope`;

async function run(changeRequest) {
  const client = new Anthropic();
  console.log('[PO Agent] Bootstrapping GitHub labels...');
  await bootstrapLabels();
  console.log('[PO Agent] Processing change request...\n');

  const result = await runAgent({
    client,
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `Process this change request and create a milestone + story issues in GitHub:\n\n${changeRequest}`,
    tools: toolDefinitions,
    handleToolCall
  });

  console.log('\n[PO Agent] Complete.\n');
  console.log(result);
  return result;
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
