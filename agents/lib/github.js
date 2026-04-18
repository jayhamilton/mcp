/**
 * Thin GitHub REST API client using Node native fetch (Node 18+).
 *
 * Required environment variable:
 *   GITHUB_TOKEN — personal access token with repo scope
 *
 * The repo owner/name is read from the git remote automatically,
 * or can be set via GITHUB_REPO (e.g. "jayhamilton/mcp").
 */

'use strict';

const { execSync } = require('child_process');

function getRepo() {
  if (process.env.GITHUB_REPO) return process.env.GITHUB_REPO;
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remote.match(/github\.com[/:]([^/]+\/[^/]+?)(\.git)?$/);
    if (match) return match[1];
  } catch (_) {}
  throw new Error('Cannot determine GitHub repo. Set GITHUB_REPO=owner/repo');
}

function getToken() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN environment variable is required');
  return token;
}

async function apiRequest(method, path, body) {
  const repo = getRepo();
  const token = getToken();
  const url = `https://api.github.com/repos/${repo}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GitHub API ${method} ${url} → ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

// --- Milestones (Epics) ---

async function listMilestones() {
  return apiRequest('GET', '/milestones?state=open&per_page=100');
}

async function createMilestone(title, description) {
  return apiRequest('POST', '/milestones', { title, description });
}

// --- Issues (Stories) ---

async function createIssue({ title, body, labels = [], milestoneNumber }) {
  const payload = { title, body, labels };
  if (milestoneNumber) payload.milestone = milestoneNumber;
  return apiRequest('POST', '/issues', payload);
}

async function getIssue(number) {
  return apiRequest('GET', `/issues/${number}`);
}

async function listIssues({ labels, state = 'open' } = {}) {
  let path = `/issues?state=${state}&per_page=100`;
  if (labels) path += `&labels=${encodeURIComponent(labels)}`;
  return apiRequest('GET', path);
}

async function updateIssue(number, updates) {
  return apiRequest('PATCH', `/issues/${number}`, updates);
}

async function addLabels(number, labels) {
  return apiRequest('POST', `/issues/${number}/labels`, { labels });
}

async function removeLabel(number, label) {
  try {
    await apiRequest('DELETE', `/issues/${number}/labels/${encodeURIComponent(label)}`);
  } catch (err) {
    // Label may not exist on the issue — ignore 404
    if (!err.message.includes('404')) throw err;
  }
}

async function addComment(number, body) {
  return apiRequest('POST', `/issues/${number}/comments`, { body });
}

async function listComments(number) {
  return apiRequest('GET', `/issues/${number}/comments?per_page=100`);
}

// --- Labels (ensure required labels exist in the repo) ---

async function ensureLabel(name, color = 'ededed', description = '') {
  try {
    await apiRequest('POST', '/labels', { name, color, description });
  } catch (err) {
    // 422 = label already exists
    if (!err.message.includes('422')) throw err;
  }
}

async function bootstrapLabels() {
  const labels = [
    { name: 'type:epic',            color: '6f42c1', description: 'Epic — groups related stories' },
    { name: 'type:story',           color: '0075ca', description: 'Story — a discrete deliverable' },
    { name: 'status:ready-for-dev', color: '28a745', description: 'Picked up by dev agent next run' },
    { name: 'status:in-dev',        color: 'f9d0c4', description: 'Dev agent is working on this' },
    { name: 'status:ready-for-qa',  color: 'e4e669', description: 'QA agent picks up next run' },
    { name: 'status:dev-rework',    color: 'd93f0b', description: 'QA failed — back to dev' },
    { name: 'status:ready-for-docs','color': '0e8a16', description: 'Docs agent picks up next run' },
    { name: 'status:done',          color: 'cfd3d7', description: 'Complete' },
    { name: 'priority:high',        color: 'b60205', description: '' },
    { name: 'priority:medium',      color: 'fbca04', description: '' },
    { name: 'priority:low',         color: 'c2e0c6', description: '' }
  ];
  for (const l of labels) {
    await ensureLabel(l.name, l.color, l.description);
  }
  console.log('[GitHub] Labels bootstrapped.');
}

// --- Status transition helper ---

const STATUS_LABELS = [
  'status:ready-for-dev',
  'status:in-dev',
  'status:ready-for-qa',
  'status:dev-rework',
  'status:ready-for-docs',
  'status:done'
];

async function setStatus(issueNumber, newStatus) {
  // Remove all existing status labels, then add the new one
  for (const label of STATUS_LABELS) {
    await removeLabel(issueNumber, label);
  }
  await addLabels(issueNumber, [`status:${newStatus}`]);
}

module.exports = {
  getRepo,
  listMilestones,
  createMilestone,
  createIssue,
  getIssue,
  listIssues,
  updateIssue,
  addLabels,
  removeLabel,
  addComment,
  listComments,
  bootstrapLabels,
  setStatus,
  STATUS_LABELS
};
