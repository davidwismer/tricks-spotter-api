import express from "express";
import { Spot } from "../model/Spot.js";
import { Trick } from "../model/Trick.js"
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

//Get all the tricks of a user
router.get("/:id/tricks", function (req, res, next) {
  Spot.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    Trick.find({ spotId: req.params.id }).exec(function (err, tricks) {
      res.send(tricks)
    })
  })
});

////////////////////////////////////////////POST
//Create new spot
router.post("/", authenticate, function (req, res, next) {
  //Get the spot created
  const newSpot = new Spot(req.body)
  //save new spot created
  newSpot.save(function (err, savedSpot) {
    if (err) {
      return next(err)
    }
    res.send(savedSpot)
  })
})

//////////////////////////////////////////DELETE
//Delete spot by id
router.delete("/:id", authenticate, function (req, res, next) {
  Spot.findByIdAndRemove({ _id: req.params.id }).exec(function (err, removedSpot) {
    if (err) {
      return next(err)
    }
    res.send(removedSpot)
  })
})

//////////////////////////////////////////PUT
router.put("/:id", authenticate, function (req, res, next) {
  Spot.findByIdAndUpdate({ _id: req.params.id}, {
    name: req.body.name,
    description: req.body.description,
    category: req.body.category,
    geolocation: req.body.geolocation,
    picture: req.body.picture,
    rating: req.body.rating
  }).exec(function (err, updatedSpot) {
    if (err) {
      return next(err);
    }
    res.send(updatedSpot);
  })
})

export default router;