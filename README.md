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
### Exclude type definitions, both from dedicated type declaration files and from within TypeScript files
`node index.js --no-types`
Options can be combined, e.g., `--no-styles --no-types`

## Story behind the project:
This script idea came after using (py2md)[https://github.com/jgravelle/Py2md], I had to create a script similar to it, but for Node.js. I wanted to be able to quickly convert a project into a single Markdown file, which could be used as context for my favorite LLM project.
The entire project was created using Claude and few seed prompts and py2md as context:
1- Create a Node.js script that converts an entire project directory containing TypeScript, JavaScript, and Svelte files into a single Markdown (MD) file, similar to the provided C# script that accomplishes this task for Python projects.
2- This works! Can you generalize to include also file extensions used by React, Vue, Solid, Astro?
3- Can you add an option to exclude the styles both for the one included inside the *Framework-specific *files and the external *Style files *css/sass...
4- Add an option to exclude interface type definitions, in certain frameworks they are defined as separate files like src/app.d.ts for svelte other times they are inside the .ts files
