import fs from 'fs';
import path from 'path';

const replacements = {
    // Whites and light grays
    'bg-white': 'bg-card',
    'bg-gray-50': 'bg-background',
    'bg-gray-100': 'bg-background',
    'bg-gray-200': 'bg-border',

    // Borders
    'border-gray-100': 'border-border',
    'border-gray-200': 'border-border',
    'border-gray-300': 'border-border',
    'border-white': 'border-card',

    // Text colors
    'text-gray-900': 'text-text-primary',
    'text-gray-800': 'text-text-primary',
    'text-gray-700': 'text-text-secondary',
    'text-gray-600': 'text-text-secondary',
    'text-gray-500': 'text-text-secondary',
    'text-gray-400': 'text-text-secondary/50',
    'text-gray-300': 'text-text-secondary/30',

    // Shadows
    'shadow-gray-200/50': 'shadow-border/50',
    'shadow-gray-100': 'shadow-border',

    // Primary
    'bg-primary-50': 'bg-primary/10',
    'bg-primary-100': 'bg-primary/20',
    'bg-primary-600': 'bg-primary',
    'bg-primary-700': 'bg-primary-hover',
    'text-primary-600': 'text-primary',
    'text-primary-700': 'text-primary-hover',
    'border-primary-100': 'border-primary/20',
    'border-primary-200': 'border-primary/50',
    'border-primary-600': 'border-primary',
    'shadow-primary-500': 'shadow-primary',

    // Bargain / Orange
    'bg-orange-50': 'bg-bargain/10',
    'bg-orange-100': 'bg-bargain/20',
    'bg-orange-500': 'bg-bargain',
    'bg-orange-600': 'bg-bargain-hover',
    'text-orange-500': 'text-bargain',
    'text-orange-600': 'text-bargain-hover',
    'text-orange-700': 'text-bargain-hover',
    'border-orange-100': 'border-bargain/20',
    'border-orange-500': 'border-bargain',

    // Seller / Success / Green
    'bg-success-50': 'bg-seller/10',
    'bg-success-100': 'bg-seller/20',
    'bg-success-500': 'bg-seller',
    'bg-success-600': 'bg-seller-hover',
    'text-success-500': 'text-seller',
    'text-success-600': 'text-seller',
    'text-success-700': 'text-seller-hover',
    'border-success-100': 'border-seller/20',
    'border-success-200': 'border-seller/50',
    'bg-green-50': 'bg-seller/10',
    'bg-green-100': 'bg-seller/20',
    'bg-green-500': 'bg-seller',
    'bg-green-600': 'bg-seller-hover',
    'text-green-500': 'text-seller',
    'text-green-600': 'text-seller',
    'text-green-700': 'text-seller-hover',
    'border-green-100': 'border-seller/20',
    'border-green-500': 'border-seller',

    // Amber / Warning
    'bg-amber-50': 'bg-warning/10',
    'text-amber-500': 'text-warning',
    'text-amber-600': 'text-warning',
    'border-amber-200': 'border-warning/50',

    // Red / Danger
    'bg-red-50': 'bg-danger/10',
    'text-red-500': 'text-danger',
    'text-red-600': 'text-danger',
    'border-red-200': 'border-danger/50'
};

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Sort from longest to shortest to prevent partial matching (e.g. text-orange-500 replaces before text-orange-50)
    const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        const escapedKey = key.split('-').join('\\-').split('/').join('\\/');
        try {
            const regex = new RegExp(`(?<![\\w\\-])` + escapedKey + `(?![\\w\\-])`, 'g');
            newContent = newContent.replace(regex, replacements[key]);
        } catch (err) {
            console.error('Regex error for key:', key, 'escapedKey:', escapedKey, err.message);
            throw err;
        }
    }

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            processFile(filePath);
        }
    }
}

walk('./src');
console.log('Refactoring complete.');
