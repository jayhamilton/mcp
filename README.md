# GenAI Context Training

An interactive, comprehensive learning module for software engineers to understand and implement the Model Context Protocol (MCP). This project provides hands-on education about MCP architecture, JSON-RPC foundations, implementation patterns, and Retrieval Augmented Generation (RAG) integration.

## 🎯 Overview

GenAI Context Training is a web-based educational platform that combines theoretical knowledge with practical implementation examples. It features interactive code editors, animated diagrams, and a comprehensive quiz system to reinforce learning.

## ✨ Features

- **Interactive Learning Sections**: 7 comprehensive modules covering MCP fundamentals
- **Live Code Examples**: Ace Editor integration with syntax highlighting and dark theme
- **Animated Diagrams**: GSAP-powered SVG animations showing MCP communication flows
- **RAG Integration Guide**: Detailed explanation of Retrieval Augmented Generation with MCP
- **Knowledge Assessment**: Interactive quiz with instant feedback
- **Progress Tracking**: Visual progress bar and section completion indicators
- **Responsive Design**: Mobile-friendly interface with smooth animations

## 📁 Project Structure

```
genai-context-training/
├── index.html                    # Main entry point (clean, modular HTML)
├── mcp_learning_module.html      # Original monolithic file (preserved)
├── CLAUDE.md                     # AI assistant guidance file
├── package.json                  # Project dependencies
├── .gitignore                    # Git ignore patterns
├── README.md                     # This file
└── src/
    ├── css/
    │   └── styles.css            # All CSS styles
    ├── content/                  # HTML content modules
    │   ├── overview.html         # Overview section content
    │   ├── jsonrpc.html          # JSON-RPC section content
    │   ├── architecture.html     # Architecture section content
    │   ├── implementation.html   # Implementation section content
    │   ├── rag.html              # RAG integration section content
    │   ├── quiz.html             # Quiz section content
    │   └── resources.html        # Resources section content
    └── js/
        ├── app.js                # Main application orchestrator
        └── modules/
            ├── navigation.js     # Navigation and state management
            ├── quiz.js           # Quiz functionality
            ├── ace-editor.js     # Code editor initialization
            ├── animations.js     # GSAP diagram animations
            ├── banner-animation.js # Banner text animation
            └── content-loader.js # Dynamic content loading
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser with ES6 module support
- Optional: Local web server for development

### Quick Start

1. **Clone or download** the repository
2. **Open `index.html`** in your web browser
3. **Start learning** through the interactive modules

### Development Setup

**Important:** This application requires a web server to load content modules. It will not work properly when opened directly as a file.

For local development:

```bash
# Install dependencies (optional)
npm install

# Serve locally using http-server
npx http-server . -p 8080

# Or use Python's built-in server
python -m http.server 8080

# Or use Node.js if you have it installed
node -e "require('http').createServer(require('fs').readFile.bind(null, 'index.html')).listen(8080)"
```

Then navigate to `http://localhost:8080`

## 📚 Learning Modules

### 1. Overview
- Core MCP concepts and benefits
- Key components and architecture
- Use cases and applications

### 2. JSON-RPC Foundation
- JSON-RPC 2.0 protocol basics
- MCP message structure
- Request/response patterns

### 3. Architecture & Design Patterns
- Client-server communication flow
- Transport layer options (HTTP, WebSocket, stdio)
- Interactive animated diagrams

### 4. Implementation Guide
- Setting up MCP servers
- Resource and tool handlers
- Practical code examples

### 5. RAG Integration
- Retrieval Augmented Generation concepts
- MCP-enhanced RAG architecture
- Multi-source knowledge retrieval

### 6. Knowledge Check
- 8-question interactive quiz
- Instant feedback and scoring
- Progress tracking

### 7. Resources
- Official documentation links
- SDK and tools
- Community examples

## 🛠 Technologies Used

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript ES6+**: Modular architecture with classes and imports
- **Ace Editor**: Syntax-highlighted code examples
- **GSAP**: Professional-grade animations and motion graphics
- **SVG**: Scalable vector graphics for diagrams

## 🎨 Design Features

- **Glassmorphism UI**: Modern frosted glass effect design
- **Smooth Animations**: CSS transitions and GSAP animations
- **Interactive Elements**: Hover effects, button animations, and visual feedback
- **Dark Code Theme**: Monokai theme for optimal code readability
- **Progress Visualization**: Animated progress bars and completion badges

## 🔧 Architecture

The project follows a modular architecture pattern:

- **Separation of Concerns**: CSS, JavaScript, and HTML are separated into logical files
- **ES6 Modules**: Clean import/export structure for maintainability
- **Component-Based**: Each feature is encapsulated in its own module
- **Event-Driven**: Global event handling for cross-module communication

## 📖 Educational Approach

The learning module is designed with educational best practices:

- **Progressive Disclosure**: Information presented in digestible chunks
- **Active Learning**: Interactive elements and hands-on examples
- **Visual Learning**: Diagrams and animations to illustrate concepts
- **Assessment**: Quiz system to reinforce knowledge retention
- **Practical Application**: Real-world code examples and implementation patterns

## 🤖 Agent-Driven Development

This project uses a multi-agent pipeline to manage change requests, implement features, run QA, and produce documentation. Epics are tracked as **GitHub Milestones** and stories as **GitHub Issues**.

### Pipeline Overview

```
Change Request
     ↓
PO Agent → creates Milestone (epic) + Issues (stories) with status:ready-for-dev
     ↓
Dev Agent → writes spec, implements, comments impl summary → status:ready-for-qa
     ↓
QA Agent → writes test plan, evaluates code, comments results → status:ready-for-docs (or dev-rework)
     ↓
Docs Agent → writes documentation, comments it, closes issue → status:done
```

### Prerequisites

- Node.js 18+ (native `fetch` required)
- A GitHub personal access token with **repo** scope
  - Create one at: GitHub → Settings → Developer settings → Personal access tokens

### Setup

```bash
# Install dependencies
npm install

# Set your GitHub token
export GITHUB_TOKEN=ghp_your_token_here

# Create the required labels in the repo (run once)
npm run bootstrap
```

### Running the Agents

```bash
# Submit a change request to the PO agent (creates Milestone + Issues)
npm run po "Add dark mode to the learning module"

# Or pass a request from a file
npm run po -- --file .work/requests/my-request.md

# Run the orchestrator once (processes all actionable issues)
npm run run

# Run the orchestrator in watch mode (polls every 60s)
npm run watch

# Target a specific issue
node agents/orchestrator.js --issue 7

# Run individual agents directly
node agents/dev-agent.js 7
node agents/qa-agent.js 7
node agents/docs-agent.js 7
```

### Local Artifacts

Agents write supporting files to `.work/` (tracked in git):

```
.work/
├── requests/        ← drop raw change request files here
├── specs/           ← dev agent writes spec before coding (SPEC-<issue>.md)
├── implementations/ ← dev agent writes impl summary (IMPL-<issue>.md)
├── test-plans/      ← QA agent writes test plan (TESTPLAN-<issue>.md)
├── test-results/    ← QA agent writes results (RESULT-<issue>.md)
└── docs/            ← docs agent writes documentation (DOC-<issue>.md)
```

Impl summaries, QA results, and documentation are also posted as comments on the GitHub issue, making each issue a complete audit trail.

### Agent Source

```
agents/
├── bootstrap.js       ← run once to set up GitHub labels
├── po-agent.js        ← Product Owner: creates milestones and issues
├── dev-agent.js       ← Developer: spec-driven implementation
├── qa-agent.js        ← QA: test plans and code review
├── docs-agent.js      ← Documentation: writes and posts docs
├── orchestrator.js    ← Routes issues to agents by status label
└── lib/
    ├── github.js        ← GitHub REST API client (native fetch)
    ├── github-tools.js  ← Anthropic SDK tool definitions for GitHub
    ├── fs-tools.js      ← Anthropic SDK tool definitions for filesystem
    └── agent-runner.js  ← Shared agentic loop
```

## 🤝 Contributing

This project serves as an educational resource. Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your improvements
4. Submit a pull request

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

## 🙏 Acknowledgments

- **Anthropic**: For the Model Context Protocol specification
- **MCP Community**: For examples and best practices
- **GSAP**: For powerful animation capabilities
- **Ace Editor**: For excellent code editing experience

## 📞 Support

For questions about MCP implementation or this learning module:
- Check the [MCP Specification](https://spec.modelcontextprotocol.io/)
- Visit the [MCP GitHub Organization](https://github.com/modelcontextprotocol)
- Review the [Example Servers](https://github.com/modelcontextprotocol/servers)

---

*GenAI Context Training - Built with ❤️ for the developer community to learn and implement Model Context Protocol effectively.*