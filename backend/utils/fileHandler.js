const fs = require('fs');

const readData = (file) => {
    return JSON.parse(fs.readFileSync(file));
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };