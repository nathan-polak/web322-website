/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Nathan Polak
Student ID: 188243216
Date: June 7th, 2024
Cyclic Web App URL: _______________________________________________________
GitHub Repository URL: https://github.senecapolytechnic.ca/npolak/web322
********************************************************************************/ 

// Requires store-service.js
const {initialize, getAllItems, getPublishedItems, getCategories} = require("./store-service.js");

// Express module
const express = require("express");
const app = express();

// Path module
const path = require("path");

// Fs moudle
const fs = require("fs");

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
    }).then((err) => {
        res.status(500).send(err);
    })
});

// Sends items file
app.get("/items", (req, res) => {
    getAllItems().then(data => {
        res.json(data);
    }).then((err) => {
        res.status(500).send(err);
    });
});

// Sends categories file
app.get("/categories", (req, res) => {
    getCategories().then(data => {
        res.json(data);
    }).then((err) => {
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
