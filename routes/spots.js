import express from "express";
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

////////////////////////////////////////////POST
//Create new spot
router.post("/", function (req, res, next) {
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
router.delete("/:id", function (req, res, next) {
  Spot.findOneAndRemove({ _id: req.params.id }).exec(function (err, removedSpot) {
    if (err) {
      return next(err)
    }
    res.send(removedSpot)
  })
})

//////////////////////////////////////////PUT
router.put("/:id", function (req, res, next) {
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