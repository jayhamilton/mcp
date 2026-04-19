# Spec: Add semantic search code examples
**Issue**: #5
**Date**: 2025-01-29

## Approach
Create a new HTML content section (`src/content/semantic-search.html`) that presents three focused, self-contained Python code examples demonstrating:

1. **Generating embeddings** from text using `sentence-transformers` (no external API key required).
2. **Storing embeddings** in a local ChromaDB vector database.
3. **Performing a semantic search query** and retrieving ranked results.

Each example will have inline comments explaining every meaningful step. A prerequisites box will list required Python packages clearly. The examples will be displayed using the same `<div class="code-block"><div class="ace-editor ...">` pattern used by all other module sections, which renders via the existing Ace editor initialization in `ace-editor.js`.

Because the Ace editor is initialised for `mode/javascript` by default in `ace-editor.js`, and the story asks for Python examples, the code blocks will use the `code-block` / `ace-editor` markup for visual consistency, but with a `data-language="python"` attribute so QA can verify intent. The content will still be readable and syntax-highlighted (Ace falls back gracefully; further language support can be added in a follow-up).

The new section will be wired into:
- `src/js/modules/content-loader.js` — add `'semantic-search'` to `sectionIds`.
- `index.html` — add a `<button>` for `showSection('semantic-search')` in the nav.

The section follows the exact same structure as existing sections: `section-title`, `learning-objectives`, `highlight-box` for prerequisites, three `code-block`/`ace-editor` blocks, and a "Mark Complete" button.

## Files to Change
- `src/content/semantic-search.html` *(new file)*: Three annotated Python code examples (embedding generation, vector storage, semantic query), prerequisites highlight-box, learning objectives — all following existing section patterns.
- `src/js/modules/content-loader.js`: Add `'semantic-search'` to the `sectionIds` array so the loader fetches and renders the new section.
- `index.html`: Add a nav button `<button class="nav-btn" onclick="showSection('semantic-search')">Semantic Search</button>` in the `.module-nav` bar.

## Files NOT to Change
- `src/js/modules/ace-editor.js`: Mode/theme settings are global — changing language mode here would break all other editors. Language-specific initialisation is out of scope for this story.
- `src/css/styles.css`: The existing `.code-block`, `.ace-editor`, `.highlight-box`, `.learning-objectives`, and `.section-title` styles already cover the new section's needs. No new styles required.
- `src/js/modules/navigation.js`: Navigation logic is generic — it already handles any `showSection(id)` call without needing modification.
- `src/js/modules/quiz.js`: Out of scope; this story is code examples only.
- All other `src/content/*.html` files: Existing content is not affected.

## Risks / Assumptions
- The Ace editor initialisation targets `mode/javascript`. Python code will still display with the dark Monokai theme but without Python-specific highlighting; QA should verify readability is acceptable for the story's acceptance criteria.
- `sentence-transformers` and `chromadb` are Python packages — they cannot run in the browser. The examples are instructional/display-only, consistent with the module's learning purpose.
- The `data-language="python"` attribute is added as a documentation hint only; it has no functional effect until a follow-up story upgrades the Ace mode logic.
- Prerequisites section calls out `pip install sentence-transformers chromadb` and Python ≥ 3.8, satisfying the AC requirement for listed dependencies.
