/**
 * Orchestrator
 *
 * Queries GitHub Issues by status label and routes each one to the correct agent.
 *
 * Pipeline:
 *   status:ready-for-dev  → dev-agent
 *   status:dev-rework     → dev-agent
 *   status:ready-for-qa   → qa-agent
 *   status:ready-for-docs → docs-agent
 *
 * Usage:
 *   node agents/orchestrator.js              # run once, process all actionable issues
 *   node agents/orchestrator.js --watch      # poll every 60s
 *   node agents/orchestrator.js --issue 42   # run a specific issue number
 *
 * Required env:
 *   GITHUB_TOKEN — personal access token with repo scope
 */

'use strict';

const { listIssues, getRepo } = require('./lib/github');

const PIPELINE = {
  'status:ready-for-dev':  { agent: 'dev-agent',  label: 'Dev' },
  'status:dev-rework':     { agent: 'dev-agent',  label: 'Dev (rework)' },
  'status:ready-for-qa':   { agent: 'qa-agent',   label: 'QA' },
  'status:ready-for-docs': { agent: 'docs-agent', label: 'Docs' }
};

function getStatusLabel(issue) {
  const labels = issue.labels.map(l => l.name);
  return Object.keys(PIPELINE).find(k => labels.includes(k));
}

async function fetchActionableIssues(targetNumber) {
  const allIssues = await listIssues({ labels: 'type:story', state: 'open' });

  if (targetNumber) {
    return allIssues.filter(i => i.number === targetNumber && getStatusLabel(i));
  }

  return allIssues.filter(i => getStatusLabel(i));
}

function printStatus(issues) {
  console.log(`\n=== Open Stories (${getRepo()}) ===`);
  if (issues.length === 0) {
    console.log('  (no open stories found)');
    return;
  }
  for (const issue of issues) {
    const statusLabel = getStatusLabel(issue);
    const stage = statusLabel ? PIPELINE[statusLabel].label : 'unknown';
    const milestone = issue.milestone ? `[${issue.milestone.title}]` : '';
    console.log(`  #${issue.number} ${milestone} "${issue.title}" → ${stage}`);
  }
  console.log('');
}

async function runIssue(issue) {
  const statusLabel = getStatusLabel(issue);
  if (!statusLabel) return;

  const { agent, label } = PIPELINE[statusLabel];
  console.log(`\n→ [Orchestrator] #${issue.number} "${issue.title}" (${label}) → ${agent}`);

  try {
    const agentModule = require(`./${agent}`);
    await agentModule.run(issue.number);
  } catch (err) {
    console.error(`[Orchestrator] ERROR in ${agent} for #${issue.number}:`, err.message);
    if (process.env.DEBUG) console.error(err.stack);
  }
}

async function tick(targetNumber) {
  let issues;
  try {
    issues = await fetchActionableIssues(targetNumber);
  } catch (err) {
    console.error('[Orchestrator] Failed to fetch issues:', err.message);
    return;
  }

  printStatus(issues);

  if (issues.length === 0) {
    console.log('[Orchestrator] No actionable stories.');
    return;
  }

  // Process sequentially to avoid GitHub API conflicts
  for (const issue of issues) {
    await runIssue(issue);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const watchMode = args.includes('--watch');
  const issueIdx = args.indexOf('--issue');
  const targetNumber = issueIdx !== -1 ? parseInt(args[issueIdx + 1], 10) : null;

  if (issueIdx !== -1 && !targetNumber) {
    console.error('ERROR: --issue requires a valid issue number');
    process.exit(1);
  }

  if (watchMode) {
    const interval = parseInt(process.env.POLL_INTERVAL_MS || '60000', 10);
    console.log(`[Orchestrator] Watch mode — polling every ${interval / 1000}s. Ctrl+C to stop.`);
    tick(targetNumber);
    setInterval(() => tick(targetNumber), interval);
  } else {
    tick(targetNumber).catch(err => {
      console.error('[Orchestrator] Fatal error:', err.message);
      process.exit(1);
    });
  }
}

module.exports = { tick };
