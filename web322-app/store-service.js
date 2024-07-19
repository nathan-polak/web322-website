// Modules
// Module: fs
const fs = require("fs");
// Module: path
const path = require("path");

// Global arrays
let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(__dirname, "../data/items.json"), "utf8", (err, data) => {
            if (err) {
                return reject(err.message);
            }
            items = JSON.parse(data);

            fs.readFile(path.resolve(__dirname, "../data/categories.json"), "utf8", (err, data) => {
                if (err) {
                    return reject(err.message);
                }
                categories = JSON.parse(data);

                // Resolves
                resolve();
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            return reject("Items has not been initialized");
        }
        else {
            return resolve(items);
        }
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        if (category < 0 || category > categories.length) {
            return reject("Invalid category: " + category);
        } else {
            const filteredItems = items.filter(item => item.category == category);
            if (filteredItems.length > 0) {
                return resolve(filteredItems);
            } else {
                return reject("No items found in category: " + category);
            }
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.postDate >= minDateStr);
        if (filteredItems.length > 0) {
            return resolve(filteredItems);
        } else {
            return reject("No items found after this date str: " + minDateStr);
        }
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.filter(item => item.id == id);
        if (item.length === 0 || item === undefined) {
            return reject("Item of id \'" + id + "\' not found");
        } else {
            return resolve(item);
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            return reject("Items has not been initialized");
        }
        else {
            resolve(items.filter(item => item.published === true));
        }
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            return reject("Categories has not been initialized");
        }
        else {
            resolve(categories);
        }
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        if (itemData.published === undefined) {
            itemData.published = false;
        } else {
            itemData.published = true;
        }

        itemData.id = itemData.length + 1;
        itemData.postDate = new Date().toISOString().split('T')[0];
        items.push(itemData);
        resolve();
    });
}

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            return reject("Items has not been initialized");
        }
        else {
            resolve(items.filter(item => item.published === true && item.category === category));
        }
    });
}

module.exports = { initialize, getAllItems, getItemsByCategory, getItemsByMinDate, getItemById, getPublishedItems, getCategories, addItem, getPublishedItemsByCategory };