// app.js - Entry point for cPanel Node.js hosting
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if built server exists
const serverPath = join(__dirname, 'dist', 'index.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ Built server not found. Please run "npm run build" first.');
  console.error('Expected file:', serverPath);
  process.exit(1);
}

import('./dist/index.js').then(server => {
  console.log('✅ Temer Properties server started successfully');
}).catch(err => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});