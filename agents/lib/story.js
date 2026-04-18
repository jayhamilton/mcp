/**
 * Utilities for reading and updating story frontmatter.
 */

const fs = require('fs');
const path = require('path');

const WORK_DIR = path.join(process.cwd(), '.work');

/**
 * Parse YAML-style frontmatter from a markdown file.
 * Returns a plain object of key/value strings.
 */
function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const fm = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key) fm[key] = value;
  });
  return fm;
}

/**
 * Update a single frontmatter field in a story file without touching the body.
 */
function updateFrontmatterField(filePath, field, value) {
  let content = fs.readFileSync(filePath, 'utf8');
  const pattern = new RegExp(`^${field}: .+$`, 'm');

  if (pattern.test(content)) {
    content = content.replace(pattern, `${field}: ${value}`);
  } else {
    // Insert field before closing ---
    content = content.replace(/^---\n([\s\S]*?)\n---/, (_, body) => {
      return `---\n${body}\n${field}: ${value}\n---`;
    });
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Get the next available ID for a given prefix (STORY, EPIC, etc.)
 * by scanning the target directory.
 */
function nextId(prefix, directory) {
  const dir = path.join(WORK_DIR, directory);
  if (!fs.existsSync(dir)) return `${prefix}-001`;

  const existing = fs.readdirSync(dir)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .map(f => {
      const match = f.match(/(\d+)\.md$/);
      return match ? parseInt(match[1], 10) : 0;
    });

  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

/**
 * Load all stories from .work/stories, returning parsed frontmatter + path.
 */
function getAllStories() {
  const dir = path.join(WORK_DIR, 'stories');
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('.'))
    .map(f => {
      const filePath = path.join(dir, f);
      const fm = parseFrontmatter(filePath);
      return { ...fm, path: filePath, file: f };
    });
}

module.exports = { parseFrontmatter, updateFrontmatterField, nextId, getAllStories };
