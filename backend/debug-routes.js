// debug-routes.js in backend folder
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for problematic routes...');

const routeFiles = [
  'src/routes/auth.js',
  'src/routes/users.js', 
  'src/routes/posts.js',
  'src/routes/requests.js',
  'src/app.js'
];

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("router.*('*')") || content.includes("app.*('*')")) {
      console.log('❌ Problematic wildcard route found in:', file);
      console.log('   Line:', content.split('\n').find(line => line.includes('*')));
    } else {
      console.log('✅', file, 'looks good');
    }
  } else {
    console.log('❌ Missing:', file);
  }
});