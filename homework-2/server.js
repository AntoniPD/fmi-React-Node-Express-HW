const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const users = require("./routers/user_router");

const url = "mongodb://localhost:27017/cooking";

mongoose.connect(url, { useNewUrlParser: true });

const database = mongoose.connection;
database.on("error", console.error.bind(console, "connection error: "));
database.once("open", () => {
  console.log("Successfully connected to MongoDB!");
});

const app = express();
app.use(bodyParser.json());
const port = 3000;

app.use("/api/users", users);

app.listen(port, () =>
  console.log(`Аpp listening at http://localhost:${port}`)
);
