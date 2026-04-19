# Spec: Create Semantic Search module page structure
**Issue**: #1
**Date**: 2026-04-18

## Approach
The application already has all the wiring for a `semantic-search` section:
- `index.html` contains a `<button class="nav-btn" onclick="showSection('semantic-search')">Semantic Search</button>` nav entry.
- `content-loader.js` already includes `'semantic-search'` in its `sectionIds` array, so the loader fetches and injects `src/content/semantic-search.html` automatically.
- `src/content/semantic-search.html` already exists but its current content front-loads advanced code examples and vector-DB deep-dives that belong to later stories (#3, #4, #5). Critically, it is **missing the required page-structure shell**: it has no `<h2 class="section-title">` heading, no `.learning-objectives` block, no introduction section, and no introductory paragraph explaining what semantic search is and why it matters in the absence of an LLM.

The fix is to **rewrite `src/content/semantic-search.html`** so it:
1. Opens with the standard `<h2 class="section-title">` heading (matching every other module).
2. Includes a `.learning-objectives` block (matching every other module).
3. Contains an introductory paragraph that clearly explains what semantic search is and why it matters when LLM access is unavailable.
4. Provides the standard placeholder content areas (Introduction, content section stubs, code examples area stub) so later stories can fill them in without structural changes.
5. Closes with the standard `<button class="btn" onclick="markSectionComplete('semantic-search')">` completion button.

All existing structural patterns (CSS class names, element hierarchy) are reused verbatim from the existing modules — no new CSS classes are introduced.

The content that was previously in the file (vector DB explanation, three Python code examples) is preserved as placeholder stubs with `<!-- content: story #N -->` comments so that subsequent stories can slot content in without merge conflicts. This satisfies the "reuse, not duplicate" principle in the technical notes.

## Files to Change
- `src/content/semantic-search.html`: Rewrite to add the correct structural shell (heading, learning objectives, intro paragraph, section stubs, complete button). This is the only deliverable for this story.

## Files NOT to Change
- `index.html`: The `semantic-search` nav button already exists — no change needed.
- `src/js/modules/content-loader.js`: `semantic-search` is already registered in `sectionIds` — no change needed.
- `src/js/app.js`: No new animation manager is required for this story (structure only).
- `src/css/styles.css`: All required CSS classes (`.section-title`, `.learning-objectives`, `.highlight-box`, `.module-section`, `.btn`) already exist. No new styles are needed.
- All other JS modules: Out of scope for a page-structure story.

## Risks / Assumptions
- The existing content (code examples, vector DB text) in `semantic-search.html` pre-empts later stories. By replacing it with stubs now we keep the page clean for QA while providing clear insertion points for stories #3–#5. QA should verify the stubs are present and the page renders without JS errors.
- The `markSectionComplete('semantic-search')` call in the completion button relies on `NavigationManager.markSectionComplete`, which is already wired globally in `app.js` — no change needed.
- The `ace-editor.js` `AceEditorManager.initializeAceEditors()` scans for `.ace-editor` divs on load; because we are removing the live editor divs in this story, no orphan editors will be initialised. This is expected and correct for a structure-only story.
