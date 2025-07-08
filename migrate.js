// =================================================================================
// MIGRATION SCRIPT - Creates the new file structure
// Run this script to automatically create the folder structure and template files
// =================================================================================

const fs = require('fs');
const path = require('path');

// Define the new folder structure
const folders = [
    'constants',
    'utils', 
    'managers',
    'services',
    'systems',
    'combat',
    'main',
    'ui'
];

// File templates with their content markers
const fileTemplates = {
    'constants/gameConstants.js': {
        imports: [],
        content: 'GAME_CONSTANTS and GameFormulas classes'
    },
    'utils/errorHandler.js': {
        imports: [],
        content: 'GameError and ErrorBoundary classes'
    },
    'utils/validators.js': {
        imports: ['./errorHandler.js'],
        content: 'GameValidators class'
    },
    'managers/resourceManager.js': {
        imports: [],
        content: 'ResourceManager class and gameResources instance'
    },
    'services/combatService.js': {
        imports: ['../managers/resourceManager.js', '../constants/gameConstants.js'],
        content: 'CombatService class'
    },
    'services/animationService.js': {
        imports: ['../managers/resourceManager.js', '../constants/gameConstants.js'],
        content: 'AnimationService class'
    },
    'services/dungeonService.js': {
        imports: ['../utils/errorHandler.js', '../constants/gameConstants.js'],
        content: 'DungeonService class'
    },
    'services/nodeInteractionService.js': {
        imports: ['../utils/validators.js', './dungeonService.js'],
        content: 'NodeInteractionService class'
    },
    'services/dungeonUIService.js': {
        imports: ['../managers/resourceManager.js'],
        content: 'DungeonUIService class'
    },
    'services/uiManager.js': {
        imports: ['../constants/gameConstants.js', '../systems/eventSystem.js'],
        content: 'UIManager class'
    },
    'services/modalService.js': {
        imports: ['../utils/errorHandler.js'],
        content: 'ModalService class'
    },
    'services/milestoneService.js': {
        imports: ['../data.js'],
        content: 'MilestoneService class'
    },
    'systems/eventSystem.js': {
        imports: [],
        content: 'GameEventSystem class and gameEvents instance'
    },
    'systems/notificationSystem.js': {
        imports: ['../constants/gameConstants.js'],
        content: 'notificationSystem class and global instance'
    },
    'combat/actionProcessor.js': {
        imports: ['../utils/validators.js', '../constants/gameConstants.js'],
        content: 'CombatActionProcessor class'
    },
    'combat/combatMain.js': {
        imports: ['../utils/errorHandler.js', './actionProcessor.js'],
        content: 'Main combat functions (executeTurn, handleActionSelection, etc.)'
    },
    'ui/characterCard.js': {
        imports: [],
        content: 'Move your existing characterCard.js here'
    },
    'main/gameController.js': {
        imports: [
            '../state.js',
            '../systems/eventSystem.js',
            '../services/uiManager.js',
            '../services/dungeonService.js'
        ],
        content: 'GameController class'
    },
    'main/bootstrap.js': {
        imports: ['./gameController.js'],
        content: 'initializeGame function and global setup'
    }
};

function createFileStructure() {
    console.log('Creating refactored file structure...');
    
    // Create folders
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log(`✓ Created folder: ${folder}/`);
        }
    });
    
    // Create template files
    Object.entries(fileTemplates).forEach(([filePath, template]) => {
        if (!fs.existsSync(filePath)) {
            const content = generateFileTemplate(filePath, template);
            fs.writeFileSync(filePath, content);
            console.log(`✓ Created file: ${filePath}`);
        }
    });
    
    // Copy existing files that don't need changes
    const filesToCopy = [
        'style.css',
        'data.js', 
        'state.js',
        'entityFactory.js'
    ];
    
    filesToCopy.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✓ Keep existing: ${file}`);
        } else {
            console.log(`⚠ Missing: ${file} (you'll need to create this)`);
        }
    });
    
    console.log('\n📁 File structure created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy code sections from the artifacts into the template files');
    console.log('2. Replace your index.html with the updated version');
    console.log('3. Move characterCard.js to ui/characterCard.js');
    console.log('4. Test that all imports work correctly');
}

function generateFileTemplate(filePath, template) {
    const fileName = path.basename(filePath, '.js');
    const imports = template.imports.map(imp => `import {} from '${imp}';`).join('\n');
    
    return `// =================================================================================
// FILE: ${filePath}
// REFACTORED: ${template.content}
// =================================================================================

${imports}

// TODO: Copy the relevant code sections from the artifacts here
// This file should contain: ${template.content}

// Export your classes/functions here
export default {};

console.log('${fileName} loaded');
`;
}