# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is GenAI Context Training - an MCP (Model Context Protocol) learning and development repository containing:

- **Primary focus**: Learning module for MCP concepts and implementation
- **Main file**: `mcp_learning_module.html` - Interactive learning module covering MCP fundamentals
- **Dependencies**: Node.js project with MCP SDK and Anthropic SDK for development

## Architecture

### Core Technologies
- **Node.js/CommonJS**: Main runtime environment
- **MCP SDK**: `@modelcontextprotocol/sdk` for Model Context Protocol implementation
- **Anthropic SDK**: `@anthropic-ai/sdk` for AI integration
- **HTML/CSS/JavaScript**: Interactive learning module with embedded educational content

### Key Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.57.0",
  "@modelcontextprotocol/sdk": "^1.17.0"
}
```

## Development Commands

### Basic Commands
- `npm install` - Install dependencies
- `npm test` - Currently returns test error (no tests configured)

### No Additional Scripts
The project currently has minimal npm scripts defined. Only the default test script exists.

## Learning Module

The main educational component is `mcp_learning_module.html`, which provides:

- **Interactive Learning**: Comprehensive MCP education with navigation between sections
- **Core Topics**: Overview, JSON-RPC 2.0, Architecture, Implementation, Tools & Resources
- **Practical Examples**: Code samples for MCP servers and clients
- **Knowledge Assessment**: Built-in quiz system for learning validation

### Module Sections
1. **Overview**: MCP fundamentals and benefits
2. **JSON-RPC**: Understanding the underlying protocol
3. **Architecture**: Client-server patterns and security
4. **Implementation**: Building MCP servers and clients
5. **Tools & Resources**: SDKs, deployment patterns, monitoring
6. **Quiz**: Knowledge validation

## Retrieval Augmented Generation (RAG)

### Overview
MCP enables sophisticated RAG implementations by providing standardized access to external data sources and tools. RAG enhances AI responses by retrieving relevant information from external knowledge bases before generating answers.

### MCP's Role in RAG
- **Resource Access**: MCP servers can expose databases, document stores, APIs, and file systems as retrievable resources
- **Tool Integration**: AI models can use MCP tools to search, filter, and process external data
- **Real-time Data**: Unlike static training data, MCP enables access to live, up-to-date information
- **Structured Retrieval**: JSON-RPC protocol ensures consistent data formats for reliable retrieval

### RAG Implementation Patterns with MCP

#### 1. Document Retrieval
```javascript
// MCP server exposing document search capability
server.addTool({
  name: "search_documents",
  description: "Search through knowledge base documents",
  parameters: {
    query: { type: "string", required: true },
    limit: { type: "number", default: 10 },
    threshold: { type: "number", default: 0.7 }
  }
});
```

#### 2. Database Query Integration
```javascript
// MCP tool for structured data retrieval
server.addTool({
  name: "query_knowledge_base",
  description: "Query structured knowledge database",
  parameters: {
    sql: { type: "string", required: true },
    context: { type: "string", description: "Context for the query" }
  }
});
```

#### 3. Multi-Source Retrieval
MCP enables querying multiple data sources simultaneously, allowing AI models to synthesize information from various sources for comprehensive responses.

### Benefits for RAG Systems
- **Standardization**: Consistent interface across different data sources
- **Security**: Built-in authentication and authorization for data access
- **Scalability**: Efficient resource management and connection pooling
- **Flexibility**: Support for various data formats and retrieval methods

## Multi-Agent Development Pipeline

The `agents/` directory contains an automated pipeline that processes GitHub Issues through dev, QA, and docs stages.

### Running the Pipeline
```bash
node agents/orchestrator.js              # process all actionable issues once
node agents/orchestrator.js --watch      # poll every 60s
node agents/orchestrator.js --issue 42   # run a specific issue
```

### GitHub Issue Status Lifecycle

Each issue carries exactly one `status:*` label at all times. Agents must update the label at the start **and** end of their work so the issue always reflects current state.

| Label | Meaning | Who sets it |
|---|---|---|
| `status:ready-for-dev` | Pending — waiting for dev agent | PO agent / manual |
| `status:in-dev` | In progress — dev agent working | Dev agent (Step 1.5) |
| `status:ready-for-qa` | Pending — waiting for QA agent | Dev agent (final step) |
| `status:in-qa` | In progress — QA agent working | QA agent (Step 1.5) |
| `status:dev-rework` | Pending — QA failed, back to dev | QA agent (final step) |
| `status:ready-for-docs` | Pending — waiting for docs agent | QA agent (final step) |
| `status:in-docs` | In progress — docs agent working | Docs agent (Step 1.5) |
| `status:done` | Complete — issue closed | Docs agent (final step) |

### Commit Convention

Each agent commits its own work as a discrete step before handing off to the next stage. Three commits are created per story:

| Agent | When to commit | Message format |
|---|---|---|
| Dev | After writing IMPL file (Step 6.5), before setting `ready-for-qa` | `feat: implement #N - <title>` |
| QA | After posting results (Step 5.5), before setting next status | `qa: test results for #N - PASS` or `FAIL` |
| Docs | After posting docs (Step 3.5), before closing the issue | `docs: complete story #N - <title>` |

Use the `git_commit` custom tool — it runs `git add -A` then `git commit`. Never skip the commit step; it is what makes the pipeline's work visible in the repo history.

### Status Update Rules
- **Every agent must set its in-progress status immediately after reading the issue** (Step 1.5 in each agent's process), before writing any files.
- **Every agent must set the next pipeline status as its final action** before exiting.
- Use `set_issue_status` (custom tool) — it atomically removes all existing `status:*` labels and adds the new one.
- Never leave an issue in a stale status; if an agent errors out mid-run, the in-progress label remains as a visible signal that work was interrupted.

### Agent Routing
The orchestrator routes issues to agents based on the pending status labels:
- `status:ready-for-dev` / `status:dev-rework` → `dev-agent`
- `status:ready-for-qa` → `qa-agent`
- `status:ready-for-docs` → `docs-agent`

## Development Notes

- This appears to be a learning/educational repository rather than a production codebase
- No existing test framework is configured
- Project uses CommonJS module system
- No build process or bundling configured - static HTML file for learning content