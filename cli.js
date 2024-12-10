#!/usr/bin/env node

const minimist = require('minimist');

const argv = minimist(process.argv.slice(2), {
    string: ['exclude'],
    boolean: ['no-styles', 'no-types', 'help', 'include-ignored'],
    alias: {
        e: 'exclude',
        h: 'help',
        i: 'include-ignored'
    }
});

if (argv.help) {
    console.log(`
Usage: node-to-md [options]

Options:
    --no-styles          Exclude style definitions
    --no-types          Exclude type definitions
    -e, --exclude       Exclude files/directories using glob patterns
                       (comma-separated, e.g., "test/**,*.spec.*")
    -i, --include-ignored Include files that match .gitignore patterns
    -h, --help          Show this help message

Examples:
    node-to-md --no-styles
    node-to-md --exclude "test/**,*.spec.*"
    node-to-md --no-types --include-ignored
`);
    process.exit(0);
}

require('./index.js');