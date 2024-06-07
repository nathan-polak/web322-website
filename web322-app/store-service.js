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
            resolve(items);
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            return reject("Categories has not been initialized");
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

module.exports = { initialize, getAllItems, getPublishedItems, getCategories };