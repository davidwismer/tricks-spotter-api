import express from "express";
import bcrypt from "bcrypt";
import { Spot } from "../model/Spot.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all spots
router.get("/", function (req, res, next) {
  Spot.find().sort('name').exec(function (err, spots) {
    if (err) {
      return next(err);
    }
    res.send(spots);
  });
});

//Get spot by id
router.get("/:id", function (req, res, next) {
  Spot.findOne({ _id: req.params.id }).exec(function (err, spot) {
    if (err) {
      return next(err)
    }
    res.send(spot)
  })
});

export default router;