const fs = require('fs');

const folders = ['constants', 'utils', 'managers', 'services', 'systems', 'combat', 'main', 'ui'];

console.log('Creating folders...');
folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
        console.log(`✓ Created: ${folder}/`);
    } else {
        console.log(`- Already exists: ${folder}/`);
    }
});

console.log('Done! Check your project folder for the new directories.');