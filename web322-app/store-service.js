const Sequelize = require('sequelize');

var sequelize = new Sequelize('SenecaDB_NathanPolak', 'SenecaDB_owner', 'N4th4nP@l4k', {
    host: 'ep-restless-base-a5ssf4p3.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Item model
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

// Category model
const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Relationship between Item & Category
Item.belongsTo(Category, { foreignKey: 'category' });

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        })
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { id: category }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Item.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { id: id }
        }).then((data) => {
            resolve(data[0]);
        }).catch((error) => {
            reject(error);
        });
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll().then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    });
}

function addItem(itemData) {   
    return new Promise((resolve, reject) => {
        
        if (itemData) {

            var test;
            if (itemData.body === "") {
                test = "No Body - empty - store";
            } else if (itemData.body === undefined) {
                test = "No body - undefined - store";
            } else {
                test = itemData.body;
            }

            const d = {
                published: (itemData.published) ? true : false,
                title: (itemData.title) ? itemData.title : null,
                price: (itemData.price) ? itemData.price : null,
                body: test,
                featureImage: (itemData.featureImage) ? itemData.featureImage : null,
                postDate: new Date()
            }

            Item.create(d).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            });
        } else {
            throw new Error("No itemData");
        }
    });
}

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true },
            where: { category: category }
        }).then((data) => {
            resolve(data);
        }).catch((error) => {
            reject(error);
        });
    });
}

function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        for (const key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }

        Category.create(categoryData).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
}

function deleteCategoryById(id) {
    Category.destroy({
        where: { id: id }
    }).then(() => {
        resolve("Destroyed");
    }).catch((error) => {
        reject(error);
    })
}

function deletePostById(id) {
    Item.destroy({
        where: { id: id }
    }).then(() => {
        resolve("Destroyed");
    }).catch((error) => {
        reject(error);
    })
}

module.exports = { initialize, getAllItems, getItemsByCategory, getItemsByMinDate, getItemById, getPublishedItems, getCategories, addItem, getPublishedItemsByCategory, addCategory, deleteCategoryById, deletePostById};