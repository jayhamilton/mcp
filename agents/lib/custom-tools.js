/**
 * Custom tool definitions for operations not covered by the MCP servers:
 *   - Milestone management (create, list) — not in GitHub MCP server
 *   - set_issue_status — convenience wrapper that handles label transitions
 *
 * These are combined with MCP server tools in each agent.
 */

'use strict';

const gh = require('./github');

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
    name: 'set_issue_status',
    description: 'Update the pipeline status of a story issue. Removes all existing status: labels and adds the new one.',
    input_schema: {
      type: 'object',
      properties: {
        issue_number: { type: 'number', description: 'GitHub issue number' },
        status: {
          type: 'string',
          enum: ['ready-for-dev', 'in-dev', 'ready-for-qa', 'dev-rework', 'ready-for-docs', 'done'],
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
