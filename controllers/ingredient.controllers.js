const express = require("express");
const { Ingredient } = require("../models");
const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const v = new Validator();

// CREATE INGREDIENT
function createIngredient(req, res, next) {
    const data = {
      id: nanoid(10),
      name: req.body.name,
      createdAt: new Date(),
    };
  
    const schema = {
      name: { type: "string", min: 5, max: 50, optional: true  },
    };
  
    // VALIDASI DATA
    const validationResult = v.validate(data, schema);
  
    if (validationResult !== true) {
      res.status(400).json({
        message: "Validation Failed",
        data: validationResult,
      });
    } else {
      Ingredient.create(data)
        .then((result) => {
          res.status(201).json({
            message: "Ingredient Created Successfully",
            data: result,
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({
            message: "Create Ingredient Failed",
            data: err,
          });
        });
    }
  }
  
// READ ALL INGREDIENTS
function readIngredients(req, res, next) {
  Ingredient.findAll()
    .then((ingredients) => {
      res.status(200).json({
        message: "Success",
        data: ingredients,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Read Ingredients Failed",
        data: err,
      });
    });
}

// READ INGREDIENT BY ID
function readIngredientById(req, res, next) {
  const ingredientId = req.params.id;

  Ingredient.findByPk(ingredientId)
    .then((ingredient) => {
      if (!ingredient) {
        res.status(404).json({
          message: "Ingredient not found",
          data: null,
        });
      } else {
        res.status(200).json({
          message: "Success",
          data: ingredient,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Read Ingredient Failed",
        data: err,
      });
    });
}

// UPDATE INGREDIENT
function updateIngredient(req, res, next) {
  const data = {
    name: req.body.name,
    description: req.body.description,
    image: req.file ? req.file.filename : req.body.image,
    updatedAt: new Date(),
  };

  const schema = {
    name: { type: "string", min: 3, max: 50, optional: true },
    description: { type: "string", min: 5, max: 255, optional: true },
    image: { type: "string", optional: true },
  };

  // VALIDASI DATA
  const validationResult = v.validate(data, schema);

  if (validationResult !== true) {
    res.status(400).json({
      message: "Validation Failed",
      data: validationResult,
    });
  } else {
    Ingredient.update(data, { where: { id: req.params.id } })
      .then((result) => {
        res.status(200).json({
          message: "Success update data",
          data: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Update Ingredient Failed",
          data: err,
        });
      });
  }
}

// DELETE INGREDIENT
function deleteIngredient(req, res, next) {
  const ingredientId = req.params.id;

  Ingredient.findByPk(ingredientId)
    .then((ingredient) => {
      if (!ingredient) {
        res.status(404).json({
          message: "Ingredient not found",
          data: null,
        });
      } else {
        Ingredient.destroy({ where: { id: ingredientId } })
          .then((result) => {
            res.status(200).json({
              message: "Success Delete Data",
              data: result,
            });
          })
          .catch((err) => {
            res.status(500).json({
              message: "Delete Ingredient Failed",
              data: err,
            });
          });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error checking ingredient existence",
        data: err,
      });
    });
}

module.exports = {
  createIngredient,
  readIngredients,
  readIngredientById,
  updateIngredient,
  deleteIngredient,
};
