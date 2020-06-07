var express = require("express");
const UserModel = require("../models/user_model");
const RecipeModel = require("../models/recipe_model");
const validator = require("validator");
const bcrypt = require("bcrypt");
const passwordValidator = require("password-validator");

var router = express.Router();

const paswordSchema = new passwordValidator();

paswordSchema.is().min(8);

router.get("/", function (req, res) {
  UserModel.find().then(function (users) {
    res.send({ users });
  });
});

router.get("/:id", async function (req, res) {
  const id = req.params.id;
  if (validator.isMongoId(id)) {
    try {
      const user = await UserModel.findById({ _id: id }).exec();
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      } else {
        return res.status(200).send(user);
      }
    } catch (err) {
      console.error(err);

      return res.status(400).send({
        message: `Something went wrong: ${err.message}`,
      });
    }
  } else {
    return res.send({
      message: "Invalid id",
    });
  }
});

router.post("/", async function (req, res) {
  const {
    name,
    username,
    password,
    gender,
    role,
    description,
    status,
  } = req.body;
  if (
    validator.isAlpha(name) &&
    username.length < 16 &&
    password.length > 8 &&
    (gender == "male" || gender == "female" || gender == "other") &&
    (role == "admin" || role == "user") &&
    description.length < 513 &&
    (status == "active" || status == "suspended" || status == "deactivated")
  ) {
    try {
      const user = await UserModel.find({
        username: username,
      }).exec();

      if (user.length >= 1) {
        return res.status(422).json({
          message: "User with this username already exists",
        });
      }

      if (paswordSchema.validate(password)) {
        const hash = await new Promise((resolve, reject) => {
          resolve(bcrypt.hash(password, 10));
        });
        const newUser = new UserModel({
          name: name,
          username: username,
          password: hash,
          gender: gender,
          role: role,
          description: description,
          status: status,
        });
        newUser.save();
        return res.location(`/${newUser.id}`).status(201).send(newUser);
      } else {
        return res.status(401).json({
          mesage: "Invalid password",
        });
      }
    } catch (err) {
      console.error(err);

      return res.status(400).send({
        message: `Something went wrong: ${err.message}`,
      });
    }
  } else {
    return res.send({
      message: "Registration failed",
    });
  }
});

router.get("/:id/recipes", async (req, res) => {
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    return res.send({
      message: "Invalid id",
    });
  }
  try {
    const user = await UserModel.findById({ _id: id }).exec();
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    } else {
      const recipes = await RecipeModel.find({ cooker: id }).exec();
      if (!recipes) {
        return res.status(404).json({
          message: "No recipes found",
        });
      } else {
        return res.status(200).send(recipes);
      }
    }
  } catch (err) {
    return res.status(400).send({
      message: `Something went wrong: ${err.message}`,
    });
  }
});

router.put("/:id", async function (req, res) {
  const {
    name,
    username,
    gender,
    role,
    imageUrl,
    description,
    status,
  } = req.body;
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    return res.send({
      message: "Invalid id",
    });
  }
  if (
    validator.isAlpha(name) &&
    username.length < 16 &&
    (gender == "male" || gender == "female" || gender == "other") &&
    (role == "admin" || role == "user") &&
    description.length < 513 &&
    (status == "active" || status == "suspended" || status == "deactivated")
  ) {
    try {
      const user = await UserModel.findById({ _id: id }).exec();
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      } else {
        try {
          const updatedUser = await UserModel.findByIdAndUpdate(
            {
              _id: id,
            },
            {
              name: name,
              username: username,
              gender: gender,
              role: role,
              imageUrl: imageUrl,
              description: description,
              status: status,
              dateOfUpdate: Date.now(),
            },
            { new: true }
          ).exec();
          return res.status(200).send(updatedUser);
        } catch (err) {
          console.error(err);
          return res.status(400).send({
            message: `Something went wrong: ${err.message}`,
          });
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(400).send({
        message: `Something went wrong: ${err.message}`,
      });
    }
  } else {
    return res.send({
      message: "Updating failed",
    });
  }
});

router.delete("/:id", async function (req, res) {
  const id = req.params.id;
  if (validator.isMongoId(id)) {
    try {
      const user = await UserModel.findById({ _id: id }).exec();
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      } else {
        const removed = await UserModel.findByIdAndRemove({ _id: id }).exec();
        return res.status(200).json({
          message: `User with ${id} deleted`,
        });
      }
    } catch (err) {
      return res.status(400).send({
        message: "Something went wrong",
      });
    }
  } else {
    return res.status(400).send({
      message: "Deleting failed",
    });
  }
});

router.get("/:id/recipes/:recipeId", async (req, res) => {
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    return res.send({
      message: "Invalid User Id",
    });
  }
  const recipeId = req.params.recipeId;
  if (!validator.isMongoId(recipeId)) {
    return res.send({
      message: "Invalid Recipe Id",
    });
  }
  try {
    const user = await UserModel.findById({ _id: id }).exec();
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    } else {
      const recipe = await RecipeModel.findById({ _id: recipeId }).exec();
      if (!recipe) {
        return res.status(404).json({
          message: "Recipe not found",
        });
      } else {
        return res.status(200).send(recipe);
      }
    }
  } catch (err) {
    return res.status(400).send({
      message: `Something went wrong: ${err.message}`,
    });
  }
});

router.post("/:id/recipes", async function (req, res) {
  const {
    title,
    shortDescription,
    cookTime,
    products,
    imageUrl,
    longDescription,
    tags,
  } = req.body;
  const id = req.params.id;
  if (!validator.isMongoId(id)) {
    return res.send({
      message: "Invalid id",
    });
  }
  if (
    title.length <= 80 &&
    shortDescription.length <= 256 &&
    products.length > 0 &&
    longDescription.length <= 2048 &&
    imageUrl != null
  ) {
    try {
      const user = await UserModel.findById({ _id: id }).exec();
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      } else {
        req.body.cooker = id;
        const recipe = new RecipeModel({
          cooker: req.body.cooker,
          title: title,
          shortDescription: shortDescription,
          cookTime: cookTime,
          products: products,
          imageUrl: imageUrl,
          longDescription: longDescription,
          tags: tags,
        });
        recipe.save();
        return res.location(`/${recipe.id}`).status(201).send(recipe);
      }
    } catch (err) {
      return res.status(400).send({
        message: `Something went wrong: ${err.message}`,
      });
    }
  } else {
    return res.send({
      message: "Some fields are missing or incorrect!",
    });
  }
});

router.put("/:id/recipes/:recipeId", async function (req, res) {
  const {
    title,
    shortDescription,
    cookTime,
    products,
    longDescription,
    tags,
  } = req.body;
  const id = req.params.id;
  const recipeId = req.params.recipeId;

  if (!validator.isMongoId(id)) {
    return res.send({
      message: "Invalid id",
    });
  }
  if (!validator.isMongoId(recipeId)) {
    return res.status(400).send({
      message: "Invalid Recipe Id",
    });
  }
  if (
    title.length <= 80 &&
    shortDescription.length <= 256 &&
    products.length > 0 &&
    longDescription.length <= 2048
  ) {
    try {
      const user = await UserModel.findById({ _id: id }).exec();
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      } else {
        const recipe = await RecipeModel.findById({ _id: recipeId }).exec();
        if (!recipe) {
          return res.status(404).send({ message: "Recipe not found" });
        } else {
          try {
            const updatedRecipe = await RecipeModel.findByIdAndUpdate(
              {
                _id: recipeId,
              },
              {
                title: title,
                shortDescription: shortDescription,
                cookTime: cookTime,
                products: products,
                longDescription: longDescription,
                tags: tags,
                dateOfUpdate: Date.now(),
              },
              { new: true }
            ).exec();
            return res.status(200).send(updatedRecipe);
          } catch (err) {
            console.error(err);
            return res.status(400).send({
              message: `Something went wrong: ${err.message}`,
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
      return res.status(400).send({
        message: `Something went wrong: ${err.message}`,
      });
    }
  } else {
    return res.send({
      message: "Updating failed",
    });
  }
});

router.delete("/:id/recipes/:recipeId", async function (req, res) {
  const id = req.params.id;
  const recipeId = req.params.recipeId;

  if (!validator.isMongoId(id)) {
    return res.status(400).send({
      message: "Invalid User Id",
    });
  }
  if (!validator.isMongoId(recipeId)) {
    return res.status(400).send({
      message: "Invalid Recipe Id",
    });
  }
  try {
    const user = await UserModel.findById({ _id: id }).exec();
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    } else {
      const recipe = await RecipeModel.findById({ _id: recipeId }).exec();
      if (!recipe) {
        return res.status(404).send({ message: "Recipe not found" });
      } else {
        const removed = await RecipeModel.findByIdAndRemove({
          _id: recipeId,
        }).exec();
        return res.status(200).json({
          message: `Recipe with ${recipeId} deleted`,
        });
      }
    }
  } catch (err) {
    return res.status(400).send({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
