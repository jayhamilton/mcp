# Spec: Write vector database instructional content
**Issue**: #4
**Date**: 2026-04-18

## Approach
Add a self-contained instructional section to the existing `src/content/semantic-search.html` file,
inserted **after the embeddings section** (i.e., after the Learning Objectives / Prerequisites
block and before the code examples), following the tone, heading levels, and component conventions
already established by other modules (overview.html, rag-vector.html, rag.html).

The new content will cover:
1. What a vector database is and how it differs from traditional (relational/keyword) databases.
2. How vectors are indexed and how similarity search works (cosine similarity, ANN / HNSW).
3. A curated reference list of popular vector databases (ChromaDB, Pinecone, Weaviate, FAISS).
4. The end-to-end flow: text → embedding → store in vector DB → query by similarity.
5. Positioning this approach as a practical alternative to LLM-based search in constrained
   environments (no API key required, runs locally, privacy-preserving).

The content will be placed between the existing Prerequisites `<div class="highlight-box">` and
the first `<h3>Example 1 …</h3>` heading so learners encounter the conceptual grounding before
the hands-on code examples.  No new HTML files, CSS rules, or JavaScript modules are required.

## Files to Change
- `src/content/semantic-search.html`: Insert new instructional HTML blocks (headings, paragraphs,
  highlight-box, and a plain definition list / highlight-box for vector DB options) between the
  Prerequisites box and Example 1.

## Files NOT to Change
- `src/js/modules/content-loader.js`: The section ID `semantic-search` is already registered —
  no loader changes needed.
- `index.html`: Navigation button for "Semantic Search" already exists.
- `src/css/styles.css`: All required classes (`highlight-box`, `section-title`, `learning-objectives`,
  `code-block`) are already defined.
- Any animation modules: out of scope per story notes.
- `src/content/rag-vector.html`, `rag.html`, or any other content file: no cross-page changes required.

## Risks / Assumptions
- The insertion point (between Prerequisites box and Example 1 heading) is visually logical but
  QA should verify the rendered flow reads naturally.
- "After the embeddings section" is interpreted as after the Prerequisites/dependencies box since
  the embeddings narrative is embedded within those examples; QA should confirm placement feels right.
- The story explicitly excludes hands-on code examples for vector DBs; only conceptual prose and
  reference lists are added.
- All referenced tools (ChromaDB, Pinecone, Weaviate, FAISS) must be mentioned at a high level only.
