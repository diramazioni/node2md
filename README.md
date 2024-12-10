# Node-js to markdown
Node.js script that converts an entire project tree for node based project (Svelte. React, Vue, Solid, Astro) into a single Markdown file, useful as context for your favorite LLM project

## File Processing:

Handles .ts, .js, and  Framework-specific files (e.g., .svelte, .vue, .jsx, .tsx)
Properly sets syntax highlighting based on file extension
Skips the node_modules directory when traversing

Extracts synopsis from README.md 
Handles different line ending types (CRLF and LF)

## Usage:
- Save it as index.js or similar in the project root directory
- Run it using Node.js: `node index.js`

### The script will:

- Create a src directory if it doesn't exist
- Generate a markdown file containing all TypeScript, - JavaScript, and Framework-specific code
- Create custom instructions for AI analysis
- Skip the node_modules directory automatically

## Options:
### Exclude all styles (both standalone and embedded)
`node index.js --no-styles`
