/**
 * GitHub tool definitions and handlers for Anthropic SDK agents.
 * Agents use these to interact with GitHub Issues and Milestones.
 */

'use strict';

const gh = require('./github');

const toolDefinitions = [
  {
    name: 'github_list_milestones',
    description: 'List open GitHub milestones (epics)',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'github_create_milestone',
    description: 'Create a GitHub milestone to represent an epic',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Milestone title (epic name)' },
        description: { type: 'string', description: 'What this epic achieves' }
      },
      required: ['title', 'description']
    }
  },
  {
    name: 'github_create_issue',
    description: 'Create a GitHub issue to represent a story',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        body: { type: 'string', description: 'Full markdown body of the issue' },
        labels: {
          type: 'array',
          items: { type: 'string' },
          description: 'Label names — always include type:story and a status: label'
        },
        milestone_number: { type: 'number', description: 'Milestone number to link this story to its epic' }
      },
      required: ['title', 'body', 'labels']
    }
  },
  {
    name: 'github_get_issue',
    description: 'Get a GitHub issue by number, including its body and labels',
    input_schema: {
      type: 'object',
      properties: {
        number: { type: 'number' }
      },
      required: ['number']
    }
  },
  {
    name: 'github_list_issues',
    description: 'List GitHub issues filtered by label',
    input_schema: {
      type: 'object',
      properties: {
        labels: { type: 'string', description: 'Comma-separated label names to filter by' },
        state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Default: open' }
      }
    }
  },
  {
    name: 'github_set_status',
    description: 'Update the status label on a story issue. Removes all existing status: labels and adds the new one.',
    input_schema: {
      type: 'object',
      properties: {
        number: { type: 'number', description: 'Issue number' },
        status: {
          type: 'string',
          enum: ['ready-for-dev', 'in-dev', 'ready-for-qa', 'dev-rework', 'ready-for-docs', 'done'],
          description: 'New status'
        }
      },
      required: ['number', 'status']
    }
  },
  {
    name: 'github_add_comment',
    description: 'Add a markdown comment to a GitHub issue (use for impl summaries, test results, docs)',
    input_schema: {
      type: 'object',
      properties: {
        number: { type: 'number', description: 'Issue number' },
        body: { type: 'string', description: 'Markdown content of the comment' }
      },
      required: ['number', 'body']
    }
  },
  {
    name: 'github_list_comments',
    description: 'List all comments on a GitHub issue',
    input_schema: {
      type: 'object',
      properties: {
        number: { type: 'number', description: 'Issue number' }
      },
      required: ['number']
    }
  },
  {
    name: 'github_close_issue',
    description: 'Close a GitHub issue (call when story status is set to done)',
    input_schema: {
      type: 'object',
      properties: {
        number: { type: 'number', description: 'Issue number' }
      },
      required: ['number']
    }
  }
];

async function handleToolCall(toolName, input) {
  try {
    switch (toolName) {

      case 'github_list_milestones': {
        const milestones = await gh.listMilestones();
        if (milestones.length === 0) return 'No open milestones.';
        return milestones.map(m =>
          `#${m.number} "${m.title}" — ${m.description || '(no description)'} (${m.open_issues} open issues)`
        ).join('\n');
      }

      case 'github_create_milestone': {
        const m = await gh.createMilestone(input.title, input.description);
        return `Created milestone #${m.number}: "${m.title}"`;
      }

      case 'github_create_issue': {
        const issue = await gh.createIssue({
          title: input.title,
          body: input.body,
          labels: input.labels || [],
          milestoneNumber: input.milestone_number
        });
        return `Created issue #${issue.number}: "${issue.title}" — ${issue.html_url}`;
      }

      case 'github_get_issue': {
        const issue = await gh.getIssue(input.number);
        const labels = issue.labels.map(l => l.name).join(', ');
        const milestone = issue.milestone ? `milestone: ${issue.milestone.title}` : 'no milestone';
        return `Issue #${issue.number}: ${issue.title}
Labels: ${labels}
${milestone}
State: ${issue.state}

${issue.body}`;
      }

      case 'github_list_issues': {
        const issues = await gh.listIssues({ labels: input.labels, state: input.state });
        if (issues.length === 0) return 'No issues found.';
        return issues.map(i => {
          const labels = i.labels.map(l => l.name).join(', ');
          return `#${i.number} "${i.title}" [${labels}]`;
        }).join('\n');
      }

      case 'github_set_status': {
        await gh.setStatus(input.number, input.status);
        return `Issue #${input.number} status set to: status:${input.status}`;
      }

      case 'github_add_comment': {
        const comment = await gh.addComment(input.number, input.body);
        return `Comment added to issue #${input.number}: ${comment.html_url}`;
      }

      case 'github_list_comments': {
        const comments = await gh.listComments(input.number);
        if (comments.length === 0) return 'No comments.';
        return comments.map((c, i) =>
          `--- Comment ${i + 1} by ${c.user.login} at ${c.created_at} ---\n${c.body}`
        ).join('\n\n');
      }

      case 'github_close_issue': {
        await gh.updateIssue(input.number, { state: 'closed', state_reason: 'completed' });
        return `Issue #${input.number} closed.`;
      }

      default:
        return `ERROR: Unknown tool: ${toolName}`;
    }
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}

module.exports = { toolDefinitions, handleToolCall };
