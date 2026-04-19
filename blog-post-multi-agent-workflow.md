# From One Agent to Four: Building a Multi-Agent Development Pipeline with Claude Code

*How a training module side project turned into a full CI pipeline powered by AI agents — and what I learned along the way.*

---

In my [last post](https://jaystevenhamilton.medium.com/how-i-educated-claude-code-to-implement-the-changes-i-wanted-to-my-angular-component-after-it-kept-cb46fb60acaa), I wrote about my first real experience with Claude Code — spending 45 minutes wrestling with Angular change detection and walking away genuinely impressed, even with the rough edges. That session planted a seed. If Claude Code could implement a complex UI feature with some guidance, what would happen if I gave it a much bigger canvas?

Last night, I found out.

## The Starting Point

I've been building an interactive learning module called **GenAI Context Training** — a web-based course that teaches software engineers how to understand and implement the Model Context Protocol (MCP). It started as a straightforward educational project: seven learning modules covering MCP architecture, JSON-RPC, RAG integration, and implementation patterns, all built with modular JavaScript, GSAP-animated SVG diagrams, Ace Editor code examples, and a built-in quiz system.

Over time, the project grew. I added a module on semantic search with embeddings, covering vector databases and ChromaDB with Python code examples. But the project was still fundamentally a teaching tool — until I started thinking about what it would look like to *practice what it preaches*.

If this module teaches MCP, shouldn't the development process itself use MCP?

## The Idea: Agents All the Way Down

The concept was ambitious: build a multi-agent development pipeline that treats the repo like a product backlog. Not a toy demo — a real pipeline where AI agents collaborate through GitHub Issues, each one handling a different stage of the software development lifecycle.

I sketched out four agents:

- **PO Agent** — Takes a plain-English change request and creates a GitHub Milestone (the epic) and Issues (the stories). This is where human intent gets translated into actionable work items.
- **Dev Agent** — Picks up an issue, writes a spec, implements the code, posts an implementation summary back to the issue, and moves it to ready-for-qa.
- **QA Agent** — Reads the issue and the implementation, writes a test plan, evaluates the code, posts results, and either moves the issue to ready-for-docs or kicks it back for rework.
- **Docs Agent** — Writes documentation, posts it to the issue, and closes it out.

Tying them all together is an **Orchestrator** that polls GitHub Issues by status label and routes each one to the correct agent. Think of it as a Kanban board where the cards move themselves.

## Building It With Claude Code

Working with Claude Code on this was a fundamentally different experience from my first session. Last time, I was asking it to implement a single UI feature. This time, I was collaborating on system architecture.

The PO Agent came together quickly. Claude Code understood the concept of translating a change request into GitHub artifacts — milestones and issues — without much hand-holding. The Dev Agent was more involved, since it needed to read issue context, generate a spec, write actual code, and post summaries back. But Claude Code handled the iterative back-and-forth well.

The QA and Docs agents followed a similar pattern. Each agent needed its own perspective on the same GitHub issue data, and Claude Code was able to maintain that separation cleanly. The Orchestrator was the glue — a polling loop that reads status labels and dispatches work — and it came together relatively quickly once the individual agents were solid.

## The MCP Refactor: Eating Our Own Cooking

Here's where things got interesting. The initial pipeline worked, but it was built with hand-rolled tool definitions — custom `github-tools.js` and `fs-tools.js` files that duplicated functionality that MCP servers already provide. For a project that *teaches* MCP, that felt wrong.

So I refactored the agents to use actual MCP servers for their tool access. GitHub operations — creating issues, posting comments, managing labels — now go through `@modelcontextprotocol/server-github`. Filesystem operations route through `@modelcontextprotocol/server-filesystem`.

This wasn't trivial. The agents now needed to launch child processes via `StdioClientTransport`, connect as MCP clients, discover tools dynamically, and proxy tool calls. It's a meaningfully more complex setup than just calling the GitHub REST API directly. And the GitHub MCP server doesn't cover everything — milestone management and label transitions still required custom tools alongside the MCP ones.

But the result is that the project now genuinely demonstrates what it teaches. The training module explains MCP architecture, and the development pipeline behind it *runs on* MCP architecture.

## Hardening the Pipeline

The last session — last night — was about making the pipeline production-aware. I added `in-dev`, `in-qa`, and `in-docs` status labels so that issues always reflect real-time state. Each agent now sets an in-progress status when it starts working and a completion status when it finishes. I also added a `git_commit` custom tool so agents commit their work at the end of each stage, and documented the full status lifecycle and commit conventions in `CLAUDE.md`.

These might sound like small changes, but they matter. Without them, you couldn't look at the GitHub Issues board and know what's actually happening. With them, the pipeline is observable — you can see which agent is working on what, and the commit history tells the story of how each feature was built.

## What I Learned

**Multi-agent workflows need clear contracts.** The agents communicate through GitHub Issues — labels, comments, and milestones. That shared protocol is what makes the pipeline work. Without a clean status lifecycle (todo → in-dev → ready-for-qa → in-qa → ready-for-docs → in-docs → done), the orchestrator can't route work and agents step on each other.

**MCP is more complex in practice than in theory.** Connecting to MCP servers as a client — spawning processes, discovering tools, proxying calls — adds real operational complexity. The payoff is standardization and reusability, but the migration from custom tools to MCP servers was not a simple find-and-replace.

**Token costs are real.** Every agent run makes multiple calls to the Claude API. Running the full four-agent pipeline against even a single story consumes a meaningful number of tokens, because each agent re-reads issue context, source files, and prior artifacts. Running in `--watch` mode continuously would accumulate charges quickly. This is something you need to budget for if you're building anything similar.

**Claude Code excels at system-level thinking.** My first session was about a single component. This time, I was designing a system with multiple interacting parts, and Claude Code was noticeably better in that mode. It could reason about the handoffs between agents, the status transitions, and the data flow through GitHub. The architecture-level work went smoother than the pixel-level UI work from my first session.

## What's Next

The pipeline is functional, but there's more I want to explore. Can the QA Agent run actual tests, not just evaluate code by reading it? Can the Dev Agent learn from QA feedback across multiple iterations? Can the Orchestrator handle parallel stories without conflicts?

And the meta question that keeps pulling me forward: at what point does the pipeline become sophisticated enough that it can improve *itself*?

For now, I'm genuinely excited about where this landed. What started as a side project to teach MCP concepts has become a working demonstration of multi-agent collaboration — built with the very tools it teaches. That kind of recursive loop is exactly what makes this space so compelling to work in.

---

*If you're interested in multi-agent workflows or MCP, I'd love to hear about what you're building. The code for the GenAI Context Training module and the agent pipeline is on GitHub.*

**Tags:** Claude Code, Multi-Agent Systems, MCP, GenAI, Software Architecture, DevOps
