import express from "express";
import { Spot } from "../model/Spot.js";
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
 * @apiQuery {Number} pageSize The number of element to show on a page (pagination)
 * @apiQuery {Number} page The page number that you want to show (pagination)
 * 
 *
 * @apiSuccess {Object[]} data The informations of the tricks
 * @apiSuccess {String} data.name Name of the tricks
 * @apiSuccess {String} data.video Video url of the tricks
 * @apiSuccess {String} data.spotId Id of the spot linked to the tricks
 * @apiSuccess {String} data.userId Id of the user linked to the tricks
 * @apiSuccess {Date} data.creationDate Creation date of the tricks
 * @apiSuccess {String} data._id Id of the trick
 * @apiSuccess {Number} page The page number currently showing
 * @apiSuccess {Number} pageSize The number of tricks showing on each page
 * @apiSuccess {Number} total The total number of tricks
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 200 OK
 *
  "data": [
    {
      "_id": "635fd5bffc9a001b10da7bf4",
      "name": "Nose Slide",
      "spotid": "63722faad51dd796f41ecd7f",
      "userid": "635fa221cf9e52f60af3c8f0",
      "creationDate": "2022-10-31T14:03:43.952Z",
      "video": "video.mp4"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 1
}
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
 * @apiParam {String} id The unique id that defines a trick
 * 
 * @apiSuccess {String} name Name of the trick
 * @apiSuccess {String} video Video url of the trick
 * @apiSuccess {String} spotId Id of the spot linked to the trick
 * @apiSuccess {String} userId Id of the user linked to the trick
 * @apiSuccess {Date} creationDate Creation date of the trick
 * @apiSuccess {String} _id Id of the trick
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 200 OK
 {
      "_id": "635fd5bffc9a001b10da7bf4",
      "name": "Nose Slide",
      "spotid": "63722faad51dd796f41ecd7f",
      "userid": "635fa221cf9e52f60af3c8f0",
      "creationDate": "2022-10-31T14:03:43.952Z",
      "video": "video.mp4"
    }
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
 * @apiPermission loged in
 * 
 * @apiHeader {String} BearerToken The token of the user connected
 * 
 * @apiBody {String{3..50}} name Mandatory name of the tricks
 * @apiBody {String} video Mandatory video url of the tricks
 * @apiBody {String} spotId Mandatory id of the spot linked to the tricks
 * @apiBody {String} userId Mandatory id of the user linked to the tricks (It is automatically set to the connected user)
 * @apiBody {Date} [creationDate] Optional creation date of the tricks
 * 
 * @apiSuccess (Success 201) {String} name Name of the trick
 * @apiSuccess (Success 201) {String} video Video url of the trick
 * @apiSuccess (Success 201) {String} spotId Id of the spot linked to the trick
 * @apiSuccess (Success 201) {String} userId Id of the user linked to the trick
 * @apiSuccess (Success 201) {Date} creationDate Creation date of the trick 
 * @apiSuccess (Success 201) {String} _id Id of the trick
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 201 OK
 * {
      "_id": "635fd5bffc9a001b10da7bf4",
      "name": "Nose Slide",
      "spotid": "63722faad51dd796f41ecd7f",
      "userid": "635fa221cf9e52f60af3c8f0",
      "creationDate": "2022-10-31T14:03:43.952Z",
      "video": "video.mp4"
    }
 * @apiError (401 Unauthorized) NotConnected The Bearer Token is missing
 * @apiError (401 Unauthorized) NotABearerToken Not a Bearer Token in header
 * @apiError (401 Unauthorized) InvalidToken The token in the header is invalid or expired
 */
router.post("/", authenticate, function (req, res, next) {
  //Sets the userId to the id of the connected user
  req.body.userId = req.currentUserId
  //Check if the spot exists
  Spot.findOne({ _id: req.body.spotId }).exec(function (err, spot) {
    if (err) {
      return next(err)
    }
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
  })
});

////////////////////////////////////////////DELETE
//Delete trick by id
/**
 * @api {delete} /tricks/:id Delete a trick
 * @apiName DeleteTrick
 * @apiGroup Trick
 * @apiPermission loged in
 * 
 * @apiHeader {String} BearerToken The token of the user connected
 * 
 * @apiParam {String} id The unique id that identifies a trick 
 * 
 * @apiSuccess {String} name Name of the trick deleted
 * @apiSuccess {String} video Video url of the trick deleted
 * @apiSuccess {String} spotId Id of the spot linked to the trick deleted
 * @apiSuccess {String} userId Id of the user linked to the trick deleted
 * @apiSuccess {Date} creationDate Creation date of the trick deleted 
 * @apiSuccess {String} _id Id of the trick deleted
 * 
 * @apiSuccessExample {json} Succes-Response:
 * HTTP/1.1 200 OK
 * {
      "_id": "635fd5bffc9a001b10da7bf4",
      "name": "Nose Slide",
      "spotid": "63722faad51dd796f41ecd7f",
      "userid": "635fa221cf9e52f60af3c8f0",
      "creationDate": "2022-10-31T14:03:43.952Z",
      "video": "video.mp4"
    }
 * 
 * @apiError (401 Unauthorized) NotConnected The Bearer Token is missing
 * @apiError (401 Unauthorized) NotABearerToken Not a Bearer Token in header
 * @apiError (401 Unauthorized) InvalidToken The token in the header is invalid or expired
 * @apiError (403 Forbidden) NotAllowed The connected user is trying to delete a trick of another user
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
 * @apiPermission loged in
 * 
 * @apiHeader {String} BearerToken The token of the user connected
 * 
 * @apiParam {String} id The unique id that identifies a trick 
 * 
 * @apiBody {String{3..50}} [name] Optional name of the tricks
 * @apiBody {String} [video] Optional video url of the tricks
 * 
 * @apiSuccess {String} name Name of the trick updated
 * @apiSuccess {String} video Video url of the trick updated
 * @apiSuccess {String} spotId Id of the spot linked to the trick updated
 * @apiSuccess {String} userId Id of the user linked to the trick updated
 * @apiSuccess {Date} creationDate Creation date of the trick updated 
 * @apiSuccess {String} _id Id of the trick updated
 * 
 * @apiSuccessExample {json} Succes-Response:
 * HTTP/1.1 200 OK
 * {
      "_id": "635fd5bffc9a001b10da7bf4",
      "name": "Nose Slide",
      "spotid": "63722faad51dd796f41ecd7f",
      "userid": "635fa221cf9e52f60af3c8f0",
      "creationDate": "2022-10-31T14:03:43.952Z",
      "video": "video.mp4"
    }
 * 
 * @apiError (401 Unauthorized) NotConnected The Bearer Token is missing
 * @apiError (401 Unauthorized) NotABearerToken Not a Bearer Token in header
 * @apiError (401 Unauthorized) InvalidToken The token in the header is invalid or expired
 * @apiError (403 Forbidden) NotAllowed The connected user is trying to update a trick of another user
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