/**
 * Bootstrap script — run once to create required GitHub labels in the repo.
 *
 * Usage:
 *   node agents/bootstrap.js
 *   npm run bootstrap
 *
 * Required env:
 *   GITHUB_TOKEN — personal access token with repo scope
 */

'use strict';

const { bootstrapLabels, getRepo } = require('./lib/github');

async function main() {
  console.log(`[Bootstrap] Setting up labels in ${getRepo()}...`);
  await bootstrapLabels();
  console.log('[Bootstrap] Done. You can now run the agents.');
}

main().catch(err => {
  console.error('[Bootstrap] Error:', err.message);
  process.exit(1);
});
