/*********************************************************************************
WEB322 – Assignment 06
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Nathan Polak
Student ID: 188243216
Date: August 16th, 2024
Cyclic Web App URL: https://web322-website-nathan-polaks-projects.vercel.app/ (It doesn't work because Vercel's pulling a Vercel)
GitHub Repository URL: https://github.senecapolytechnic.ca/npolak/web322
GitHub Personal Repository (I'm sorry, Vercel wouldn't take my Seneca account) URL: https://github.com/nathan-polak/web322
********************************************************************************/

// Assignment 6
const authData = require("./auth-service.js");
const mongoose = require('mongoose');
const clientSessions = require('client-sessions');

// Requires store-service.js
const itemData = require("./store-service.js");

// Express module
const express = require("express");
const app = express();

// Path module
const path = require("path");

// Fs moudle
const fs = require("fs");

// Multer module
const multer = require('multer');
const upload = multer(); // no {storage: storage}

// Express-Handlebars module
const exphbs = require('express-handlebars');
app.engine(".hbs", exphbs.engine({
    extname: ".hbs",
    "defaultLayout": "main",
    helpers: {
        navLink: function (url, options) {
            return '<li class="nav-item">' +
                '<a' + ((url == app.locals.activeRoute) ? ' class="nav-link active"' : ' class="nav-link"') +
                ' href="' + url + '">' + options.fn(this) + '</a>' +
                '</li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set("view engine", ".hbs");

// Cloudinary module
const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dcstvcloe',
    api_key: 'API-FirstKey',
    api_secret: 'tMiK6heFqIZ6D8yM6y4ZmhqpL7c',
    secure: true
});

// Streamifier module
const streamifier = require('streamifier');

// HTTP Port
const HTTP_PORT = process.env.PORT || 8080;

// Uses views directory
app.use(express.static(path.join(__dirname, "../views")));

// Uses public directory
app.use(express.static(path.resolve(__dirname, "../public")));

// Active route 
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    clientSessions({
        cookieName: 'NotADataStealer',
        secret: 'a&n2Pu*2ndhHU33@@DfwMB92y3HDMMdvc&7373BEBhugc#^gsj*wj02ksvgci',
        duration: 2 * 60 * 1000,
        activeDuration: 1000 * 60,
    })
);
app.use(function (req, res, next) {
    res.locals.session = req.NotADataStealer;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.NotADataStealer.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

const requiresLogin = ['/items', '/categories', '/post', '/category', '/userHistory'];

requiresLogin.forEach(route => {
    app.use(`${route}`, ensureLogin);
});

// Redirects
app.get("/", (req, res) => {
    res.redirect("/shop");
});

app.get("/login", (req, res) => {
    res.render(path.resolve(__dirname, "../views/login.hbs"));
});

app.get("/register", (req, res) => {
    res.render(path.resolve(__dirname, "../views/register.hbs"));
});

app.post("/register", (req, res) => {
    authData.registerUser(req.body).then(() => {
        res.render(path.resolve(__dirname, "../views/register.hbs"), { successMessage: "User created" })
    }).catch((err) => {
        res.render(path.resolve(__dirname, "../views/register.hbs"), { errorMessage: err, userName: req.body.userName })
    });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get("User-Agent");

    authData.checkUser(req.body).then((user) => {
        const newUserSession = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }

        req.NotADataStealer.user = newUserSession;

        res.redirect('/items');
    }).catch((err) => {
        res.render(path.resolve(__dirname, "../views/login.hbs"), { errorMessage: err, userName: req.body.userName })
    });
});

app.get("/logout", (req, res) => {
    req.NotADataStealer.reset();
    res.redirect("/");
});

app.get("/userHistory", (req, res) => {
    res.render(path.resolve(__dirname, "../views/userHistory.hbs"));
})
























// Sends to about page
app.get("/about", (req, res) => {
    res.render(path.resolve(__dirname, "../views/about.hbs"));
});

// Gets shop page
app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "item" objects
        let items = [];

        // if there's a "category" query, filter the returned items by category
        if (req.query.category) {
            // Obtain the published "item" by category
            items = await itemData.getPublishedItemsByCategory(req.query.category);
        } else {
            // Obtain the published "items"
            items = await itemData.getPublishedItems();
        }

        // sort the published items by itemDate
        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

        // get the latest item from the front of the list (element 0)
        let item = items[0];

        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
        viewData.item = item;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await itemData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    // render the "shop" view with all of the data (viewData)
    res.render(path.resolve(__dirname, "../views/shop.hbs"), { data: viewData });
});

// Gets shop item by id
app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {

        // declare empty array to hold "item" objects
        let items = [];

        // if there's a "category" query, filter the returned items by category
        if (req.query.category) {
            // Obtain the published "items" by category
            items = await itemData.getPublishedItemsByCategory(req.query.category);
        } else {
            // Obtain the published "items"
            items = await itemData.getPublishedItems();
        }

        // sort the published items by itemDate
        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the item by "id"
        viewData.item = await itemData.getItemById(req.params.id);
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await itemData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "shop" view with all of the data (viewData)
    res.render(path.resolve(__dirname, "../views/shop.hbs"), { data: viewData })
});

// Sends items file
app.get("/items", (req, res) => {
    const category = req.query.category;
    const minDateStr = req.query.minDate;
    //console.log("category: " + category);
    //console.log("midDateStr: " + minDateStr);

    if (category) {
        //console.log("category search");
        itemData.getItemsByCategory(category).then(data => {
            res.render(path.resolve(__dirname, "../views/items.hbs"), { items: data });
        }).catch((err) => {
            res.status(500).render(path.resolve(__dirname, "../views/items.hbs"), { message: err.message });
        });
    }
    else if (minDateStr) {
        //console.log("date search");
        itemData.getItemsByMinDate(minDateStr).then(data => {
            res.render(path.resolve(__dirname, "../views/items.hbs"), { items: data });
        }).catch((err) => {
            res.status(500).render(path.resolve(__dirname, "../views/items.hbs"), { message: err.message });
        });
    } else {
        //console.log("all search");
        itemData.getAllItems().then(data => {
            res.render(path.resolve(__dirname, "../views/items.hbs"), { items: data });
        }).catch((err) => {
            res.status(500).render(path.resolve(__dirname, "../views/items.hbs"), { message: err.message });
        });
    }
});

// Sends specific file
app.get("/items/:id", (req, res) => {
    const id = req.params.id;

    itemData.getItemById(id).then(data => {
        res.render(path.resolve(__dirname, "../views/items.hbs"), { items: data });
    }).catch((err) => {
        res.status(500).render(path.resolve(__dirname, "../views/items.hbs"), { message: err.message });
    });
});

// Sends to addItem page
app.get("/add-items", (req, res) => {
    res.render(path.resolve(__dirname, "../views/addItem.hbs"));
})

// Posts item to items page
app.post("/items/add", (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        upload(req).then((uploaded) => {
            processItem(uploaded.url, req, res);
        });
    } else {
        processItem("", req, res);
    }
    function processItem(imageUrl, req, res) {
        //res.json(req.body);

        if (!req) {
            throw new Error("No Request");
        } else if (!req.body) {
            throw new Error("No Request Body");
        } else {
            const newItem = {
                featureImage: imageUrl,
                title: req.body.title,
                price: req.body.price,
                published: req.body.published,
                body: test
            };

            itemData.addItem(newItem).then(() => {
                res.redirect("/items");
            }).catch((err) => {
                res.status(500);
            });
        }
    }
});

// Sends categories file
app.get("/categories", (req, res) => {
    itemData.getCategories().then(data => {
        res.render(path.resolve(__dirname, "../views/categories.hbs"), { categories: data });
    }).catch((err) => {
        res.status(500).render(path.resolve(__dirname, "../views/categories.hbs"), { message: err.message });
    });
});

// Sends to get categories
app.get("/categories/add", (req, res) => {
    res.render(path.resolve(__dirname, "../views/addCategory.hbs"));
});

// Adds category
app.post("/categories/add", (req, res) => {
    if (!req) {
        throw new Error("No Request");
    } else if (!req.body) {
        throw new Error("No Request Body");
    } else {
        const newCat = {
            category: req.body.category
        };

        itemData.addCategory(newCat).then(() => {
            res.redirect("/categories");
        }).catch((err) => {
            res.status(500);
        });
    }
});

// Sends categories file
app.get("/categories/delete/:id", (req, res) => {
    id = req.params.id;

    itemData.deleteCategoryById(id).then((data) => {
        res.render(path.resolve(__dirname, "../views/categories.hbs"), { categories: data });
    }).catch(() => {
        res.status(500).message("Unable to Remove Category / Category not found");
    });
});

// Sends categories file
app.get("/items/delete/:id", (req, res) => {
    id = req.params.id;

    itemData.deletePostById(id).then((data) => {
        res.render("items", { items: data });
    }).catch((err) => {
        res.status(500).message("Unable to Remove Post / Item");
    });
});

// Gets CSS file
app.get("/main.css", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/css/main.css"));
});

// Redirects to 404 page
app.use((req, res) => {
    res.status(404).render(path.resolve(__dirname, "../views/404.hbs"));
});

// App listens to HTTP_PORT
itemData.initialize().then(authData.initialize()).then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err.message);
});
