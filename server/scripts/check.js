const fs=require('fs');
const path=require('path');
const required=[
 'server/src/server.js','server/src/auth.js','server/src/db.js',
 'web/index.html','web/src/app.js','web/src/styles.css',
 'server/migrations/001_init.sql','server/migrations/002_seed.sql'
];
const missing=required.filter(x=>!fs.existsSync(path.join(process.cwd(),x)));
if(missing.length){console.error('Missing:',missing);process.exit(1)}
console.log('Project structure OK.');
