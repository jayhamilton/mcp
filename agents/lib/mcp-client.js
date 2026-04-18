/**
 * MCP client factory.
 * Creates connected clients for the GitHub and filesystem MCP servers.
 */

'use strict';

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const GITHUB_SERVER  = path.join(ROOT, 'node_modules/@modelcontextprotocol/server-github/dist/index.js');
const FS_SERVER      = path.join(ROOT, 'node_modules/@modelcontextprotocol/server-filesystem/dist/index.js');

async function createGitHubClient() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN environment variable is required');

  const transport = new StdioClientTransport({
    command: 'node',
    args: [GITHUB_SERVER],
    env: { ...process.env }
  });

  const client = new Client({ name: 'mcp-agent', version: '1.0.0' });
  await client.connect(transport);
  return client;
}

async function createFilesystemClient(allowedDir = ROOT) {
  const transport = new StdioClientTransport({
    command: 'node',
    args: [FS_SERVER, allowedDir]
  });

  const client = new Client({ name: 'mcp-agent', version: '1.0.0' });
  await client.connect(transport);
  return client;
}

/**
 * Convert MCP tool list format → Anthropic SDK tool format.
 */
function toAnthropicTools(tools) {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema
  }));
}

/**
 * Call an MCP tool and return the result as a plain string.
 */
async function callTool(client, name, input) {
  const result = await client.callTool({ name, arguments: input });

  if (result.isError) {
    const msg = result.content.map(c => c.text || JSON.stringify(c)).join(' ');
    return `ERROR: ${msg}`;
  }

  return result.content
    .map(c => {
      if (c.type === 'text') return c.text;
      return JSON.stringify(c);
    })
    .join('\n');
}

module.exports = { createGitHubClient, createFilesystemClient, toAnthropicTools, callTool };
