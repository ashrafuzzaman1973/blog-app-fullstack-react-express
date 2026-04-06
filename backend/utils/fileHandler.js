const fs = require('fs');

const readData = (filePath) => {
    try {
        // 1. Check if file exists
        if (!fs.existsSync(filePath)) {
            return [];
        }

        const data = fs.readFileSync(filePath, 'utf8');

        // 2. Check if file is empty string
        if (!data || data.trim() === "") {
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file from ${filePath}:`, error);
        return []; // Return empty array instead of crashing
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Error writing file to ${filePath}:`, error);
    }
};

module.exports = { readData, writeData };