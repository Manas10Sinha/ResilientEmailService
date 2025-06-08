const express = require("express");
const emailRoutes = require("./routes/emailRouter");

const app = express();
app.use(express.json());
app.use("/email-service", emailRoutes);

module.exports = app;
