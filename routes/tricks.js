import express from "express";
import { Trick } from "../model/Trick.js";
import { User } from "../model/User.js"
import authenticate from "../utils/auth.js";
import { broadcastMessage } from "../ws.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all tricks
/**
 * @api {get} /tricks Request a list of the tricks
 * @apiName GetTricks
 * @apiGroup Trick
 * 
 * @apiSuccess {Object[]} tricks List of all tricks
 */
router.get("/", function (req, res, next) {
  Trick.find().count(function (err, total) { //To paginate the tricks
    if (err) {
      return next(err);
    }
    let query = Trick.find().sort({ creationDate: -1 })
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
      res.status(200).send({
        data: tricks,
        page: page,
        pageSize: pageSize,
        total: total
      })
    })
  });
});

//Get trick by id
/**
 * @api {get} /tricks/:id Request a trick's information by id
 * @apiName GetTrick
 * @apiGroup Trick
 * 
 * @apiParam {string} TrickId id Unique identifier of the trick
 * 
 * @apiSuccess {Object[]} TrickById the trick with the given id
 */
router.get("/:id", function (req, res, next) {
  Trick.findOne({ _id: req.params.id }).exec(function (err, trick) {
    if (err) {
      return next(err)
    }
    res.status(200).send(trick)
  })
});

////////////////////////////////////////////POST
//Create new trick
/**
 * @api {post} /tricks Create a new trick
 * @apiName PostTrick
 * @apiGroup Trick
 * 
 * @apiParam {String} name Name of the trick
 * @apiParam {String} spotid Id of the spot where the trick is done
 * @apiParam {String} userid Id of the user who did the trick
 * 
 * @apiSuccess {Object[]} NewTrick created with the trick's informations
 */
router.post("/", authenticate, function (req, res, next) {
  //Sets the userId to the id of the connected user
  req.body.userId = req.currentUserId
  //Get the trick created
  const newTrick = new Trick(req.body)
  //save new trick created
  newTrick.save(function (err, savedTrick) {
    if (err) {
      return next(err)
    }
    res.status(201).send(savedTrick)
    //Send message to wss if trick created with the user that posted it
    User.findOne({ _id: req.currentUserId }).exec(function (err, user) {
      if (err) {
        return next(err)
      }
      broadcastMessage({ Update: `New trick has been posted by ${user.userName}`, newTrick: savedTrick })
    })
  })
});

////////////////////////////////////////////DELETE
//Delete trick by id
/**
 * @api {delete} /tricks/:id Delete a trick
 * @apiName DeleteTrick
 * @apiGroup Trick
 * 
 * @apiParam {String} TrickId id Unique identifier of the trick
 * 
 * @apiSuccess {Object[]} DeletedTrick the deleted trick 
 */
router.delete("/:id", authenticate, function (req, res, next) {
  Trick.findOne({ _id: req.params.id }).exec(function (err, trick) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in we delete the trick
    if (trick.userId == req.currentUserId) {
      Trick.findByIdAndDelete({ _id: req.params.id }).exec(function (err, removedTrick) {
        if (err) {
          return next(err)
        }
        res.status(200).send(removedTrick)
      })
    } else {
      res.status(403).send("Don't have the rights to do that")
    }
  })
})

///////////////////////////////////////////PUT
//Update trick by id
/**
 * @api {put} /tricks/:id Update a trick
 * @apiName PutTrick
 * @apiGroup Trick
 * 
 * @apiParam {String} id Unique identifier of the trick
 * 
 * @apiSuccess {Object[]} UpdatedTrick the trick updated
 */
router.put("/:id", authenticate, function (req, res, next) {
  Trick.findOne({ _id: req.params.id }).exec(function (err, trick) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in we update the trick
    if (trick.userId == req.currentUserId) {
      Trick.findByIdAndUpdate({ _id: req.params.id }, {
        name: req.body.name,
        video: req.body.video
      }, { new: true, runValidators: true }).exec(function (err, updatedTrick) {
        if (err) {
          return next(err)
        }
        res.status(200).send(updatedTrick)
      })
    } else {
      res.status(403).send("Don't have the rights to do that")
    }
  })
})

export default router;