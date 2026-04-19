/**
 * Custom tool definitions for operations not covered by the MCP servers:
 *   - Milestone management (create, list) — not in GitHub MCP server
 *   - set_issue_status — convenience wrapper that handles label transitions
 *   - git_commit — stage all changes and create a local git commit
 *
 * These are combined with MCP server tools in each agent.
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const gh = require('./github');

const REPO_ROOT = path.join(__dirname, '..', '..');

const toolDefinitions = [
  {
    name: 'list_milestones',
    description: 'List open GitHub milestones (epics). Returns milestone number, title, and description.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'create_milestone',
    description: 'Create a GitHub milestone to represent an epic.',
    input_schema: {
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Milestone title (epic name, under 60 chars)' },
        description: { type: 'string', description: 'What this epic achieves' }
      },
      required: ['title', 'description']
    }
  },
  {
    name: 'git_commit',
    description: 'Stage all changed and new files then create a git commit with the given message.',
    input_schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Commit message (imperative tense, under 72 chars for the first line)' }
      },
      required: ['message']
    }
  },
  {
    name: 'set_issue_status',
    description: 'Update the pipeline status of a story issue. Removes all existing status: labels and adds the new one.',
    input_schema: {
      type: 'object',
      properties: {
        issue_number: { type: 'number', description: 'GitHub issue number' },
        status: {
          type: 'string',
          enum: ['ready-for-dev', 'in-dev', 'ready-for-qa', 'in-qa', 'dev-rework', 'ready-for-docs', 'in-docs', 'done'],
          description: 'New pipeline status'
        }
      },
      required: ['issue_number', 'status']
    }
  }
];

async function handleToolCall(name, input) {
  try {
    switch (name) {
      case 'list_milestones': {
        const milestones = await gh.listMilestones();
        if (milestones.length === 0) return 'No open milestones.';
        return milestones
          .map(m => `#${m.number}  "${m.title}"  —  ${m.description || '(no description)'}`)
          .join('\n');
      }

      case 'create_milestone': {
        const m = await gh.createMilestone(input.title, input.description);
        return `Created milestone #${m.number}: "${m.title}"`;
      }

      case 'git_commit': {
        execSync('git add -A', { cwd: REPO_ROOT, stdio: 'pipe' });
        const out = execSync(`git commit -m ${JSON.stringify(input.message)}`, { cwd: REPO_ROOT, stdio: 'pipe' });
        return out.toString().trim();
      }

      case 'set_issue_status': {
        await gh.setStatus(input.issue_number, input.status);
        return `Issue #${input.issue_number} status set to: status:${input.status}`;
      }

      default:
        return `ERROR: Unknown custom tool: ${name}`;
    }
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}

module.exports = { toolDefinitions, handleToolCall };
