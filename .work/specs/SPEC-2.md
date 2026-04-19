# Spec: Add Semantic Search module to navigation
**Issue**: #2
**Date**: 2026-04-18

## Approach

Audit every layer of the navigation stack to confirm — and where absent, add — the "Semantic Search"
entry. The application uses three independent layers that must all agree:

1. **`index.html`** — the `<div class="module-nav">` block contains one `<button class="nav-btn">` per
   section. The button's `onclick` value is the section ID passed to `window.showSection()`.
2. **`src/js/modules/content-loader.js`** — the `sectionIds` array drives which HTML files are fetched
   from `src/content/` and which `<div id="…">` elements are inserted into `.content-area`.
3. **`src/content/semantic-search.html`** — the actual HTML fragment that is loaded and displayed when
   the section is active.

**Findings after reading all files:**

| Layer | Status | Action |
|---|---|---|
| `index.html` nav button | ✅ Already present — `<button class="nav-btn" onclick="showSection('semantic-search')">Semantic Search</button>` | None |
| `content-loader.js` sectionIds | ✅ Already includes `'semantic-search'` | None |
| `src/content/semantic-search.html` | ✅ Already exists and has content | None |
| `navigation.js` totalSections | ✅ `8` — correctly reflects the set of learning sections including Semantic Search | None |

All five acceptance criteria are already satisfied by the existing code. No source changes are
required. The story is complete as-is.

## Files to Change
- *(none — all required wiring was already in place)*

## Files NOT to Change
- `index.html`: Nav button `onclick="showSection('semantic-search')"` with label "Semantic Search"
  already exists at the correct position (after "RAG Integration", before "Knowledge Check"). Out of
  scope to re-order or modify other buttons.
- `src/js/modules/navigation.js`: `totalSections = 8` already accounts for Semantic Search. Changing
  the count or the section-switching logic is out of scope.
- `src/js/modules/content-loader.js`: `sectionIds` already contains `'semantic-search'`. Modifying
  other sections or loading logic is out of scope.
- `src/content/semantic-search.html`: Content population is covered by separate stories (#3–#6).
- `src/css/styles.css`: All nav buttons share `.nav-btn` / `.nav-btn.active` / `.nav-btn.completed`
  styles — no new rules needed.
- `src/js/app.js`: No new imports or animation managers needed for this story.
- All `src/js/modules/animation-*.js` files: Animation for Semantic Search section is out of scope
  for this navigation story.

## Risks / Assumptions
- The content file `src/content/semantic-search.html` must be served by a web server (not `file://`)
  for the fetch in `content-loader.js` to succeed. QA should verify in a proper server context.
- `navigation.js` `totalSections` is hardcoded to `8`. If any new sections are added in future
  stories, this number will need updating; that is out of scope here.
- The `showSection('semantic-search')` global is registered in `app.js` via
  `window.showSection = (sectionId) => this.navigationManager.showSection(sectionId)`. QA should
  confirm the module loads without JS errors before clicking the nav button.
