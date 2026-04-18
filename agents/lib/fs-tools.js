/**
 * Filesystem tool definitions and handlers for Anthropic SDK agents.
 * All file paths are relative to the project root (process.cwd()).
 */

const fs = require('fs');
const path = require('path');

const toolDefinitions = [
  {
    name: 'read_file',
    description: 'Read the full contents of a file',
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path relative to project root' }
      },
      required: ['file_path']
    }
  },
  {
    name: 'write_file',
    description: 'Write content to a file, creating parent directories as needed',
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path relative to project root' },
        content: { type: 'string', description: 'Full content to write' }
      },
      required: ['file_path', 'content']
    }
  },
  {
    name: 'list_files',
    description: 'List files in a directory',
    input_schema: {
      type: 'object',
      properties: {
        directory: { type: 'string', description: 'Directory path relative to project root' }
      },
      required: ['directory']
    }
  },
  {
    name: 'file_exists',
    description: 'Check whether a file or directory exists',
    input_schema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path relative to project root' }
      },
      required: ['file_path']
    }
  }
];

function handleToolCall(toolName, toolInput) {
  const root = process.cwd();

  switch (toolName) {
    case 'read_file': {
      const fullPath = path.join(root, toolInput.file_path);
      if (!fs.existsSync(fullPath)) return `ERROR: File not found: ${toolInput.file_path}`;
      return fs.readFileSync(fullPath, 'utf8');
    }

    case 'write_file': {
      const fullPath = path.join(root, toolInput.file_path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, toolInput.content, 'utf8');
      return `OK: Written ${toolInput.file_path}`;
    }

    case 'list_files': {
      const fullPath = path.join(root, toolInput.directory);
      if (!fs.existsSync(fullPath)) return `ERROR: Directory not found: ${toolInput.directory}`;
      const files = fs.readdirSync(fullPath).filter(f => !f.startsWith('.'));
      return files.length > 0 ? files.join('\n') : '(empty)';
    }

    case 'file_exists': {
      const fullPath = path.join(root, toolInput.file_path);
      return fs.existsSync(fullPath) ? 'true' : 'false';
    }

    default:
      return `ERROR: Unknown tool: ${toolName}`;
  }
}

module.exports = { toolDefinitions, handleToolCall };
