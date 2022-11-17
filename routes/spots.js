import express from "express";
import { Spot } from "../model/Spot.js";
import { Trick } from "../model/Trick.js"
import { User } from "../model/User.js";
import authenticate from "../utils/auth.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all spots
router.get("/", function (req, res, next) {
  //To filter the spots by category
  let query = Spot.find().sort({creationDate: -1})
  if (req.query.category) {
    query = query.where('category').equals(req.query.category);
  }

  //To paginate the spots
  const maxPage = 10 //Max elements per page
  let page = parseInt(req.query.page, 10);
  if (isNaN(page) || page < 1) {
    page = 1
  }

  let pageSize = parseInt(req.query.pageSize, 10);
  if (isNaN(pageSize) || pageSize < 0 || pageSize > maxPage) {
    pageSize = maxPage;
  }

  query = query.skip((page - 1) * pageSize).limit(pageSize)

  query.exec(function (err, spots) {
    if (err) {
      return next(err);
    }
    res.send({
      data: spots,
      page: page,
      pageSize: pageSize,
      total: spots.length
    })
  })
})

//Get spot by id
router.get("/:id", function (req, res, next) {
  Spot.findOne({ _id: req.params.id }).exec(function (err, spot) {
    if (err) {
      return next(err)
    }
    res.send(spot)
  })
});

//Get all the tricks of a spot
router.get("/:id/tricks", function (req, res, next) {
  Spot.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    Trick.find({ spotId: req.params.id }).count(function (err, total) { //To Paginate the tricks
      if (err) {
        return next(err);
      }
      let query = Trick.find({ spotId: req.params.id }).sort({creationDate: -1})
      const maxPage = 10

      let page = parseInt(req.query.page, 10);
      if (isNaN(page) || page < 1) {
        page = 1
      }

      let pageSize = parseInt(req.query.pageSize, 10);
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
    })
  })
});

////////////////////////////////////////////POST
//Create new spot
router.post("/", authenticate, function (req, res, next) {
  User.findOne({ _id: req.currentUserId }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    if (user.admin) {
      //Get the spot created
      const newSpot = new Spot(req.body)
      //save new spot created
      newSpot.save(function (err, savedSpot) {
        if (err) {
          return next(err)
        }
        res.send(savedSpot)
      })
    } else {
      res.status(403).send("Only admins can do this")
    }
  })
})


//////////////////////////////////////////DELETE
//Delete spot by id
router.delete("/:id", authenticate, function (req, res, next) {
  User.findOne({ _id: req.currentUserId }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    if (user.admin) {
      Spot.findByIdAndRemove({ _id: req.params.id }).exec(function (err, removedSpot) {
        if (err) {
          return next(err)
        }
        res.send(removedSpot)
      })
    } else {
      res.status(403).send("You don't have the rights to do that")
    }
  })

})

//////////////////////////////////////////PUT
router.put("/:id", authenticate, function (req, res, next) {
  User.findOne({ _id: req.currentUserId }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    if (user.admin) {
      Spot.findByIdAndUpdate({ _id: req.params.id }, {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        geolocation: req.body.geolocation,
        picture: req.body.picture,
        rating: req.body.rating
      }, { new: true, runValidators: true }).exec(function (err, updatedSpot) {
        if (err) {
          return next(err);
        }
        res.send(updatedSpot);
      })
    }else{
      res.status(403).send("You don't have the rights to do that")
    }
  })

})

export default router;