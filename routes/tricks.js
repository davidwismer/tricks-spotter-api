import express from "express";
import { Trick } from "../model/Trick.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all tricks
router.get("/", function (req, res, next) {
  Trick.find().sort('name').exec(function (err, tricks) {
    if (err) {
      return next(err);
    }
    res.send(tricks);
  });
});

//Get trick by id
router.get("/:id", function (req, res, next) {
  Trick.findOne({ _id: req.params.id }).exec(function (err, trick) {
    if (err) {
      return next(err)
    }
    res.send(trick)
  })
});

////////////////////////////////////////////POST
//Create new trick
router.post("/", function (req, res, next) {
  //Get the trick created
  const newTrick = new Trick(req.body)
  //save new trick created
  newTrick.save(function (err, savedTrick) {
    if (err) {
      return next(err)
    }
    res.send(savedTrick)
  })
});

////////////////////////////////////////////DELETE
//Delete trick by id
router.delete("/:id", function (req, res, next) {
  Trick.findOneAndRemove({ _id: req.params.id }).exec(function (err, removedTrick) {
    if (err) {
      return next(err)
    }
    res.send(removedTrick)
  })
})

///////////////////////////////////////////PUT

export default router;