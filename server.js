/*********************************************************************************
WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Nathan Polak
Student ID: 188243216
Date: June 21st, 2024
Cyclic Web App URL: https://web322-website-nathan-polaks-projects.vercel.app/ (It doesn't work because Vercel's pulling a Vercel)
GitHub Repository URL: https://github.senecapolytechnic.ca/npolak/web322
GitHub Personal Repository (I'm sorry, Vercel wouldn't take my Seneca account) URL: https://github.com/nathan-polak/web322
********************************************************************************/

// Requires store-service.js
const { initialize, getAllItems, getItemsByCategory, getItemsByMinDate, getItemById, getPublishedItems, getCategories, addItem } = require("./store-service.js");

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

// Redirects
app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../views/about.html"));
});

// Sends to about page
app.get("/about", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../views/about.html"));
});

// Sends filtered items file
app.get("/shop", (req, res) => {
    getPublishedItems().then(data => {
        res.json(data);
    }).catch((err) => {
        res.status(500).send(err);
    })
});

// Sends items file
app.get("/items", (req, res) => {
    const category = req.query.category;
    const minDateStr = req.query.minDate;
    //console.log("category: " + category);
    //console.log("midDateStr: " + minDateStr);

    if (category) {
        //console.log("category search");
        getItemsByCategory(category).then(data => {
            res.json(data);
        }).catch((err) => {
            res.status(500).send(err);
        });
    }
    else if (minDateStr) {
        //console.log("date search");
        getItemsByMinDate(minDateStr).then(data => {
            res.json(data);
        }).catch((err) => {
            res.status(500).send(err);
        });
    } else {
        //console.log("all search");
        getAllItems().then(data => {
            res.json(data);
        }).catch((err) => {
            res.status(500).send(err);
        });
    }
});

// Sends specific file
app.get("/items/:id", (req, res) => {
    const id = req.params.id;

    getItemById(id).then(data => {
        res.json(data);
    }).catch((err) => {
        res.status(404).send(err);
    });
});

// Sends to addItem page
app.get("/add-item", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../views/addItem.html"));
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
            processItem(uploaded.url);
        });
    } else {
        processItem("");
    }
    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        // TODO: Process the req.body and add it as a new Item before redirecting to /items

        const itemData = JSON.stringify(req.body);
        addItem(itemData).then(() => {
            res.redirect("/items");
        });
    }
});

// Sends categories file
app.get("/categories", (req, res) => {
    getCategories().then(data => {
        res.json(data);
    }).catch((err) => {
        res.status(500).send(err);
    });
});

// Gets CSS file
app.get("/main.css", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../public/css/main.css"));
});

// Redirects to 404 page
app.use((req, res) => {
    res.status(404).sendFile(path.resolve(__dirname, "../views/404.html"));
});

// App listens to HTTP_PORT
initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("Express http server listening on: " + HTTP_PORT);
    });
}).catch((err) => {
    console.log(err.message);
});
