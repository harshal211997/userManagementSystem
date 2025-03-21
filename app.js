const express = require("express");
const app = express();

//Request body parser
app.use(express.json());

module.exports = app;
