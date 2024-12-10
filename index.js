const fs = require('fs').promises;
const path = require('path');

async function main() {
    try {
        // Get command line arguments
        const args = process.argv.slice(2);
        
        // Get the current directory
        const currentDirectory = process.cwd();
        const currentDirectoryName = path.basename(currentDirectory);

        // Create the 'src' directory path
        const srcDirectory = path.join(currentDirectory, 'src');

        // Create the 'src' directory if it doesn't exist
        try {
            await fs.access(srcDirectory);
        } catch {
            await fs.mkdir(srcDirectory);
        }

        // Create the markdown file name based on the current directory name
        const markdownFileName = `${currentDirectoryName}.md`;
        const markdownFilePath = path.join(srcDirectory, markdownFileName);

        // Initialize content array to store all file contents
        const markdownContent = [];

        // Function to process files of specific extensions
        async function processFiles(extensions) {
            for (const ext of extensions) {
                const files = await getAllFiles(currentDirectory, ext);
                
                for (const file of files) {
                    const fileContent = await fs.readFile(file, 'utf8');
                    const relativePath = path.relative(currentDirectory, file);
                    
                    // Determine the language for syntax highlighting
                    let language;
                    switch (path.extname(file)) {
                        case '.ts':
                            language = 'typescript';
                            break;
                        case '.js':
                            language = 'javascript';
                            break;
                        case '.svelte':
                            language = 'svelte';
                            break;
                        default:
                            language = 'plaintext';
                    }

                    // Add file content to markdown
                    markdownContent.push(`# ${relativePath}\n`);
                    markdownContent.push(`\`\`\`${language}`);
                    markdownContent.push(fileContent);
                    markdownContent.push('```\n');
                }
            }
        }

        // Process all relevant file types
        await processFiles(['.ts', '.js', '.svelte']);

        // Write the markdown file
        await fs.writeFile(markdownFilePath, markdownContent.join('\n'));

        // Create custom instructions file
        const customInstructionsPath = path.join(srcDirectory, 'custom_instructions.txt');
        const synopsis = await getProjectSynopsis(currentDirectory, currentDirectoryName);
        
        const customInstructions = [
            synopsis || `[Please provide a synopsis of the ${currentDirectoryName} project.]`,
            '',
            `Please act as an expert TypeScript/JavaScript/Svelte developer and software engineer. The attached ${markdownFileName} file contains the complete and up-to-date codebase for our application. Your task is to thoroughly analyze the codebase, understand its programming flow and logic, and provide detailed insights, suggestions, and solutions to enhance the application's performance, efficiency, readability, and maintainability.`,
            '',
            'We highly value responses that demonstrate a deep understanding of the code. Please ensure your recommendations are thoughtful, well-analyzed, and contribute positively to the project\'s success. Your expertise is crucial in helping us improve and upgrade our application.'
        ].join('\n');

        await fs.writeFile(customInstructionsPath, customInstructions);

        console.log(`All files have been compiled into ${markdownFilePath}`);
        console.log(`Custom instructions have been created at ${customInstructionsPath}`);

    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

// Helper function to recursively get all files with specific extension
async function getAllFiles(directory, extension) {
    const files = [];
    
    async function traverse(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Skip node_modules directory
                if (entry.name === 'node_modules') continue;
                await traverse(fullPath);
            } else if (entry.isFile() && path.extname(fullPath) === extension) {
                files.push(fullPath);
            }
        }
    }
    
    await traverse(directory);
    return files;
}

// Helper function to get project synopsis from README.md
async function getProjectSynopsis(currentDirectory, currentDirectoryName) {
    try {
        const readmePath = path.join(currentDirectory, 'README.md');
        const readmeContent = await fs.readFile(readmePath, 'utf8');
        
        // Extract the first non-header, non-empty line as the synopsis
        const lines = readmeContent.split(/\r?\n/);
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (!trimmedLine) continue;
            if (trimmedLine.startsWith('#')) continue;
            if (trimmedLine.startsWith('```')) continue;
            
            // Found a valid line for synopsis
            return trimmedLine;
        }
    } catch {
        return '';
    }
}

// Run the script
main();
