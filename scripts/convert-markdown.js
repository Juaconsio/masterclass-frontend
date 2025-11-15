// Script to convert markdown files to JSON at build time
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertMarkdownToJSON(inputDir, outputFile) {
  const dataDir = path.join(__dirname, '..', inputDir);
  
  if (!fs.existsSync(dataDir)) {
    console.log(`Directory ${inputDir} not found, creating empty array`);
    const outputPath = path.join(__dirname, '..', 'src', 'data', outputFile);
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    return;
  }

  const files = fs.readdirSync(dataDir);
  
  const data = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(dataDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      
      return {
        ...data,
        slug: file.replace(/\.md$/, ''),
        content,
      };
    });

  const outputPath = path.join(__dirname, '..', 'src', 'data', outputFile);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`✓ Converted ${data.length} files from ${inputDir} to ${outputFile}`);
}

// Convert courses and reviews
convertMarkdownToJSON('src/data/courses', 'courses.json');
convertMarkdownToJSON('src/data/reviews', 'reviews.json');
