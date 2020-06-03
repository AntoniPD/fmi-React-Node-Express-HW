const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/cooking";

mongoose.connect(url, { useNewUrlParser: true });

const database = mongoose.connection;
database.on("error", console.error.bind(console, "connection error: "));
database.once("open", () => {
  console.log("Successfully connected to MongoDB!");
});

const recipes = require("./routers/recipes_router");
const users = require("./routers/user_router");

const sendErrorResponse = require("./utils").sendErrorResponse;

const app = express();
// app.use(express.json());
app.use(bodyParser.json());
const port = 3000;

app.use("/api/recipes", recipes);
app.use("/api/users", users);

let nextId = 0;
let posts = new Map();

app.get("/", (req, res) => res.type("html").send("<h2>Hello World!<h2>"));

app.post("/hello/:name", (req, res) => {
  const post = req.body;

  res.type("html").send(`<h1>Hi ${req.params.name} <h1>`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  sendErrorResponse(
    req,
    res,
    500,
    `Internal server error: ${err.message}`,
    err
  );
});

app
  .route("/book")
  .get(function (req, res) {
    res.send("Get a random book");
  })
  .post(function (req, res) {
    res.send("Add a book");
  })
  .put(function (req, res) {
    res.send("Update the book");
  });

// Posts API Feature
app.post("/posts", (req, res) => {
  console.log("asd");
  const post = req.body;
  post.id = ++nextId;
  posts.set(post.id, post);
  res.status(201).location(`/posts/${post.id}`).json(post);
  //   res.type("html").send(`<h1>Hi ${req.params.name} <h1>`);
});

app.get("/posts", (req, res) => {
  res.json(Array.from(posts.values()));
});

app.get("/posts/:id", (req, res) => {
  res.json(posts.get(+req.params.id));
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
