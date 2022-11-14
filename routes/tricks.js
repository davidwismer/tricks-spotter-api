import express from "express";
import { Trick } from "../model/Trick.js";
import authenticate from "../utils/auth.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all tricks
router.get("/", function (req, res, next) {
  Trick.find().count(function (err, total) { //To paginate the tricks
    if (err) {
      return next(err);
    }
    let query = Trick.find()
    const maxPage = 10

    let page = parseInt(req.query.page, maxPage);
    if (isNaN(page) || page < 1) {
      page = 1
    }

    let pageSize = parseInt(req.query.pageSize, maxPage);
    if (isNaN(pageSize) || pageSize < 0 || pageSize > maxPage) {
      pageSize = maxPage;
    }

    query = query.skip((page - 1) * pageSize).limit(pageSize)

    query.exec(function (err, tricks) {
      if (err) {
        return next(err);
      }
      res.send({
        data: tricks,
        page: page,
        pageSize: pageSize,
        total: total
      })
    })
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
router.post("/", authenticate, function (req, res, next) {
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
router.delete("/:id", authenticate, function (req, res, next) {
  Trick.findByIdAndRemove({ _id: req.params.id }).exec(function (err, removedTrick) {
    if (err) {
      return next(err)
    }
    res.send(removedTrick)
  })
})

///////////////////////////////////////////PUT
router.put("/:id", authenticate, function (req, res, next) {
  Trick.findByIdAndUpdate({ _id: req.params.id}, {
    name: req.body.name,
    video: req.body.video
  }, {new: true, runValidators: true}).exec(function (err, updatedTrick) {
    if (err) {
      return next(err);
    }
    res.send(updatedTrick);
  })
})

export default router;