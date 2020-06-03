var express = require("express");
const RecipeModel = require("../models/recipe_model");

const sendErrorResponse = require("../utils").sendErrorResponse;

var router = express.Router();

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});
// TODO: return all recipes
router.get("/", function (req, res) {
  RecipeModel.find().then(function (recipes) {
    res.send({ recipes });
  });
});

// TODO: return single recipe
router.get("/:id", function (req, res) {
  RecipeModel.findById(req.params.id).then(function (doc) {
    res.send(doc);
  });
});

// TODO: update single recipe
router.put("/:id", function (req, res) {
  res.send("Update recipe by id");
});

// TODO: delete single recipe
router.delete("/:id", function (req, res) {
  RecipeModel.findOneAndRemove(req.params.id)
    .exec()
    .then(function (doc) {
      return doc;
    })
    .catch(function (error) {
      throw error;
    });
  res.send("Delete recipe by id");
});

// TODO: create recipe
router.post("/", function (req, res) {
  var recipe = {
    // usedId: req.body.usedId,
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    cookTime: req.body.cookTime,
    products: req.body.products,
    longDescription: req.body.longDescription,
    tags: req.body.tags,
  };

  // var data = new RecipeModel(recipe);
  RecipeModel.insertOne(recipe)
    .then((res) => {
      res.location(`/${recipe._id}`).status(201).send(recipe);
    })
    .catch((err) => {
      if (err) {
        console.log(err);
        res.status(403).send(err);
      }
    });
  // var saved = data.save((err) => {
  //   if (err) {
  //     console.log(err);
  //     res.status(403).send(err);
  //   }
  // });

  // res.location(`/${data.id}`).status(201).send(data);
});

module.exports = router;
