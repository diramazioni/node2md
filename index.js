const fs = require('fs').promises;
const path = require('path');

// Define file types and their corresponding languages for syntax highlighting
const FILE_TYPES = {
    // TypeScript
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.mts': 'typescript',
    '.cts': 'typescript',
    
    // JavaScript
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.mjs': 'javascript',
    '.cjs': 'javascript',
    
    // Framework-specific
    '.svelte': 'svelte',
    '.vue': 'vue',
    '.astro': 'astro',
    
    // Solid
    '.jsx': 'javascript',
    '.tsx': 'typescript',
    
    // Style files
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',
    '.styl': 'stylus',
    
    // Config files
    '.postcss': 'css',
    '.styled': 'javascript'
};

// Style-related file extensions
const STYLE_EXTENSIONS = new Set(['.css', '.scss', '.sass', '.less', '.styl', '.postcss']);

async function main() {
    try {
        // Get command line arguments
        const args = process.argv.slice(2);
        const excludeStyles = args.includes('--no-styles');
        
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

        // Get all files
        const files = await getAllFiles(currentDirectory, Object.keys(FILE_TYPES));
        
        // Sort files by extension and then by path for better organization
        files.sort((a, b) => {
            const extA = path.extname(a);
            const extB = path.extname(b);
            if (extA === extB) {
                return a.localeCompare(b);
            }
            return extA.localeCompare(extB);
        });

        // Process each file
        for (const file of files) {
            const extension = path.extname(file);
            
            // Skip style files if --no-styles flag is present
            if (excludeStyles && STYLE_EXTENSIONS.has(extension)) {
                continue;
            }

            let fileContent = await fs.readFile(file, 'utf8');
            const relativePath = path.relative(currentDirectory, file);
            const language = FILE_TYPES[extension] || 'plaintext';

            // Process framework-specific files to remove styles if --no-styles flag is present
            if (excludeStyles) {
                fileContent = await removeStyles(fileContent, extension);
            }

            // Add file content to markdown with a header showing the file type
            markdownContent.push(`# ${relativePath} (${language})\n`);
            markdownContent.push(`\`\`\`${language}`);
            markdownContent.push(fileContent);
            markdownContent.push('```\n');
        }

        // Write the markdown file
        await fs.writeFile(markdownFilePath, markdownContent.join('\n'));

        // Create custom instructions file
        const customInstructionsPath = path.join(srcDirectory, 'custom_instructions.txt');
        const synopsis = await getProjectSynopsis(currentDirectory, currentDirectoryName);
        
        const frameworks = [
            'TypeScript', 'JavaScript', 'React', 'Vue', 
            'Svelte', 'Solid', 'Astro'
        ].join('/');

        const customInstructions = [
            synopsis || `[Please provide a synopsis of the ${currentDirectoryName} project.]`,
            '',
            `Please act as an expert ${frameworks} developer and software engineer. The attached ${markdownFileName} file contains the complete and up-to-date codebase for our application${excludeStyles ? ' (excluding styles)' : ''}. Your task is to thoroughly analyze the codebase, understand its programming flow and logic, and provide detailed insights, suggestions, and solutions to enhance the application's performance, efficiency, readability, and maintainability.`,
            '',
            'We highly value responses that demonstrate a deep understanding of the code. Please ensure your recommendations are thoughtful, well-analyzed, and contribute positively to the project\'s success. Your expertise is crucial in helping us improve and upgrade our application.'
        ].join('\n');

        await fs.writeFile(customInstructionsPath, customInstructions);

        // Print summary statistics
        const fileStats = files.reduce((acc, file) => {
            const ext = path.extname(file);
            if (!excludeStyles || !STYLE_EXTENSIONS.has(ext)) {
                acc[ext] = (acc[ext] || 0) + 1;
            }
            return acc;
        }, {});

        console.log(`All files have been compiled into ${markdownFilePath}`);
        console.log(`Custom instructions have been created at ${customInstructionsPath}`);
        console.log(`Styles ${excludeStyles ? 'excluded' : 'included'} in the output`);
        console.log('\nFile statistics:');
        Object.entries(fileStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([ext, count]) => {
                console.log(`${ext}: ${count} files`);
            });

    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

// Helper function to remove styles from framework files
async function removeStyles(content, extension) {
    switch (extension) {
        case '.vue':
            // Remove <style> blocks from Vue files
            return content.replace(/<style(\s[^>]*)?>[^]*?<\/style>/gi, '');
            
        case '.svelte':
            // Remove <style> blocks from Svelte files
            return content.replace(/<style(\s[^>]*)?>[^]*?<\/style>/gi, '');
            
        case '.astro':
            // Remove <style> blocks from Astro files
            return content.replace(/<style(\s[^>]*)?>[^]*?<\/style>/gi, '');
            
        default:
            return content;
    }
}

// Helper function to recursively get all files with specific extensions
async function getAllFiles(directory, extensions) {
    const files = [];
    
    async function traverse(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Skip node_modules and common build directories
                if (['node_modules', 'dist', 'build', '.git', 'out'].includes(entry.name)) continue;
                await traverse(fullPath);
            } else if (entry.isFile() && extensions.includes(path.extname(fullPath))) {
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
