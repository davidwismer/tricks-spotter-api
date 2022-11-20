import express from "express";
import { Spot } from "../model/Spot.js";
import { Trick } from "../model/Trick.js"
import { User } from "../model/User.js";
import authenticate from "../utils/auth.js";
import { broadcastMessage } from "../ws.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all spots
/**
 * @api {get} /spots Request a list of the spots
 * @apiName GetSpots
 * @apiGroup Spot
 * 
 * @apiQuery {Number} pageSize The number of element to show on a page (pagination)
 * @apiQuery {Number} page The page number that you want to show (pagination)
 * @apiQuery {String[]{['ledge', 'gap', 'rail', 'flat', 'ramp', 'manual', 'drop', 'park', 'bowl']}} category The category of the spots that you want to show (filter)
 *
 * @apiSuccess {Object[]} data The informations of the spots
 * @apiSuccess {String} data.name Name of the spots
 * @apiSuccess {String} data.description Description of the spots
 * @apiSuccess {String[]} data.category Category of the spots
 * @apiSuccess {Number[]} data.geolocation Geolocation of the spots
 * @apiSuccess {String} data.picture Picture of the spots
 * @apiSuccess {Number} data.rating Rating of the spots
 * @apiSuccess {Date} data.creationDate Creation date of the spots
 * @apiSuccess {String} data._id Id of the spots
 * @apiSuccess {Number} page The page number currently showing
 * @apiSuccess {Number} pageSize The number of spots showing on each page
 * @apiSuccess {Number} total The total number of spots
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 200 OK
 *{
  "data":[
     {
        "name": "Ledges d'Ouchy",
        "description": "Ledges au bord du lac Léman à Ouchy",
        "category": "ledge",
        "geolocation": [46.505929, 6.625972],
        "picture": "picture.png",
        "rating": "3",
        "creationDate": "2022-11-20T15:05:20.254Z",
        "_id": "637a42301497883f834a5caa"
    },
    {
        "name": "Rail d'Ouchy",
        "description": "Rail au bord du lac Léman à Ouchy",
        "category": "rail",
        "geolocation": [46.505929, 6.625972],
        "picture": "picture.png",
        "rating": "5",
        "creationDate": "2022-11-20T15:05:20.254Z",
        "_id": "637a42301597883f834a5cbd"
    }],
  "page": 1,
  "pageSize": 10,
  "total": 2
  }
 */
router.get("/", function (req, res, next) {
  //To filter the spots by category
  let query = Spot.find().sort({ creationDate: -1 })
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
    res.status(200).send({
      data: spots,
      page: page,
      pageSize: pageSize,
      total: spots.length
    })
  })
})

//Get spot by id
/**
 * @api {get} /spots/:id Request a spot's information
 * @apiName GetSpot
 * @apiGroup Spot
 * 
 * @apiParam {String} id The unique id that defines a spot
 * 
 * @apiSuccess {String} name Name of the spots
 * @apiSuccess {String} description Description of the spots
 * @apiSuccess {String[]} category Category of the spots
 * @apiSuccess {Number[]} geolocation Geolocation of the spots
 * @apiSuccess {String} picture Picture of the spots
 * @apiSuccess {Number} rating Rating of the spots
 * @apiSuccess {Date} creationDate Creation date of the spots
 * @apiSuccess {String} _id Id of the spots
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 200 OK
 {
        "name": "Ledges d'Ouchy",
        "description": "Ledges au bord du lac Léman à Ouchy",
        "category": "ledge",
        "geolocation": [46.505929, 6.625972],
        "picture": "picture.png",
        "rating": "3",
        "creationDate": "2022-11-20T15:05:20.254Z",
        "_id": "637a42301497883f834a5caa"
    }
 */
router.get("/:id", function (req, res, next) {
  Spot.findOne({ _id: req.params.id }).exec(function (err, spot) {
    if (err) {
      return next(err)
    }
    res.status(200).send(spot)
  })
});

//Get all the tricks of a spot
/**
 * @api {get} /spots/:id/tricks Request a list of the tricks linked to a spot
 * @apiName GetSpotTricks
 * @apiGroup Spot
 * 
 * @apiParam {String} id The unique id that identifies a spot
 * 
 * @apiQuery {Number} pageSize The number of element to show on a page (pagination)
 * @apiQuery {Number} page The page number that you want to show (pagination)
 * 
 * @apiSuccess {Object[]} data The informations of the tricks
 * @apiSuccess {String} data.name The name of the tricks
 * @apiSuccess {String} data.video The url of the video of the tricks
 * @apiSuccess {String} data.creationDate The creation date of the tricks
 * @apiSuccess {String} data.userId The id of the user that posted the tricks
 * @apiSuccess {String} data.spotId The id of the spot at which the tricks are linked
 * @apiSuccess {String} data._id The id of the tricks
 * @apiSuccess {Number} page The page number currently showing
 * @apiSuccess {Number} pageSize The number of tricks showing on each page
 * @apiSuccess {Number} total The total number of tricks posted by the user
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 200 OK
 *{
        "data": [
          {
            "_id": "637a61912e03c1b8f403b973",
            "name": "nose slide",
            "video": "video.mp4",
            "creationDate": "2022-11-19T18:31:44.268Z",
            "spotId": "637a61912e03c1b8f403b970",
            "userId": "637a61912e03c1b8f403b964"
          },
          {
            "_id": "637a61912e03c1b8f403b972",
            "name": "board slide",
            "video": "video.mp4",
            "creationDate": "2022-11-18T18:31:44.268Z",
            "spotId": "637a61912e03c1b8f403b970",
            "userId": "637a61912e03c1b8f403b964"
          }
        ],
        "page": 1,
        "pageSize": 10,
        "total": 2
  }
 */
router.get("/:id/tricks", function (req, res, next) {
  Spot.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    Trick.find({ spotId: req.params.id }).count(function (err, total) { //To Paginate the tricks
      if (err) {
        return next(err);
      }
      let query = Trick.find({ spotId: req.params.id }).sort({ creationDate: -1 })
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
    })
  })
});

////////////////////////////////////////////POST
//Create new spot
/**
 * @api {post} /spots Create a new spot
 * @apiName PostSpot
 * @apiGroup Spot
 * @apiPermission admin
 * 
 * @apiHeader {String} BearerToken The token of the user connected
 * 
 * @apiBody {String{3..50}} name Mandatory name of the spot
 * @apiBody {String{3..300}} description Mandatory description of the spot
 * @apiBody {String[]{['ledge', 'gap', 'rail', 'flat', 'ramp', 'manual', 'drop', 'park', 'bowl']}} category Mandatory category of the spot
 * @apiBody {Number[]} geolocation Mandatory geolocation of the spot
 * @apiBody {String} picture Mandatory picture url of the spot
 * @apiBody {Number{1..10}} [rating] Optional rating of the spot
 * @apiBody {Date} [creationDate=Date.now] Optional creation date of the spot
 * 
 * @apiSuccess (Success 201) {String} name Name of the spot
 * @apiSuccess (Success 201) {String} description Description of the spot
 * @apiSuccess (Success 201) {String[]} category Category of the spot
 * @apiSuccess (Success 201) {Number[]} geolocation Geolocation of the spot
 * @apiSuccess (Success 201) {String} picture Picture url of the spot
 * @apiSuccess (Success 201) {Number} rating Rating of the spot
 * @apiSuccess (Success 201) {String} creationDate Creation date of the spot
 * @apiSuccess (Success 201) {String} _id Id of the spot 
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 201 OK
 * {
        "name": "Ledges d'Ouchy",
        "description": "Ledges au bord du lac Léman à Ouchy",
        "category": "ledge",
        "geolocation": [46.505929, 6.625972],
        "picture": "picture.png",
        "rating": "3",
        "creationDate": "2022-11-20T15:05:20.254Z",
        "_id": "637a42301497883f834a5caa"
    }
 * @apiError (401 Unauthorized) NotConnected The Bearer Token is missing
 * @apiError (401 Unauthorized) NotABearerToken Not a Bearer Token in header
 * @apiError (401 Unauthorized) InvalidToken The token in the header is invalid or expired
 * @apiError (403 Forbidden) NotAllowed The user is not an admin
 */
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
        res.status(201).send(savedSpot)
        broadcastMessage({ Update: `New Spot available to ride`, newSpot: savedSpot })
      })
    } else {
      res.status(403).send("Only admins can do this")
    }
  })
})


//////////////////////////////////////////DELETE
//Delete spot by id
/**
 * @api {delete} /spots/:id Delete a spot
 * @apiName DeleteSpot
 * @apiGroup Spot
 * @apiPermission admin
 * 
 * @apiHeader {String} BearerToken The token of the user connected
 * 
 * @apiParam {String} id The unique id that identifies a spot 
 * 
 * @apiSuccess {String} name Name of the spot deleted
 * @apiSuccess {String} description Description of the spot deleted
 * @apiSuccess {String[]} category Category of the spot deleted
 * @apiSuccess {Number[]} geolocation Geolocation of the spot deleted
 * @apiSuccess {String} picture Picture url of the spot deleted
 * @apiSuccess {Number} rating Rating of the spot deleted
 * @apiSuccess {String} creationDate Creation date of the spot deleted
 * @apiSuccess {String} _id Id of the spot deleted
 * 
 * @apiSuccessExample {json} Succes-Response:
 * HTTP/1.1 200 OK
 * {
        "name": "Ledges d'Ouchy",
        "description": "Ledges au bord du lac Léman à Ouchy",
        "category": "ledge",
        "geolocation": [46.505929, 6.625972],
        "picture": "picture.png",
        "rating": "3",
        "creationDate": "2022-11-20T15:05:20.254Z",
        "_id": "637a42301497883f834a5caa"
    }
 * 
 * @apiError (401 Unauthorized) NotConnected The Bearer Token is missing
 * @apiError (401 Unauthorized) NotABearerToken Not a Bearer Token in header
 * @apiError (401 Unauthorized) InvalidToken The token in the header is invalid or expired
 * @apiError (403 Forbidden) NotAllowed The user is not an admin
 **/
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
        res.status(200).send(removedSpot)
      })
    } else {
      res.status(403).send("You don't have the rights to do that")
    }
  })

})

//////////////////////////////////////////PUT
//Update spot by id
/**
 * @api {put} /spots/:id Update a spot
 * @apiName PutSpot
 * @apiGroup Spot
 * @apiPermission admin
 * 
 * @apiHeader {String} BearerToken The token of the user connected
 * 
 * @apiParam {String} id The unique id that identifies a spot 
 * 
 * @apiBody {String{3..50}} [name] Optional name of the spot
 * @apiBody {String{3..300}} [description] Optional description of the spot
 * @apiBody {String[]{['ledge', 'gap', 'rail', 'flat', 'ramp', 'manual', 'drop', 'park', 'bowl']}} [category] Optional category of the spot
 * @apiBody {Number[]} [geolocation] Optional geolocation of the spot
 * @apiBody {String} [picture] Optional picture url of the spot
 * @apiBody {Number{1..10}} [rating] Optional rating of the spot
 * 
 * @apiSuccess {String} name Name of the spot updated
 * @apiSuccess {String} description Description of the spot updated
 * @apiSuccess {String[]} category Category of the spot updated
 * @apiSuccess {Number[]} geolocation Geolocation of the spot updated
 * @apiSuccess {String} picture Picture url of the spot updated
 * @apiSuccess {Number} rating Rating of the spot updated
 * @apiSuccess {String} creationDate Creation date of the spot updated
 * @apiSuccess {String} _id Id of the spot updated
 * 
 * @apiSuccessExample {json} Succes-Response:
 * HTTP/1.1 200 OK
 * {
        "name": "Ledges d'Ouchy",
        "description": "Ledges au bord du lac Léman à Ouchy",
        "category": "ledge",
        "geolocation": [46.505929, 6.625972],
        "picture": "picture.png",
        "rating": "3",
        "creationDate": "2022-11-20T15:05:20.254Z",
        "_id": "637a42301497883f834a5caa"
    }
 * 
 * @apiError (401 Unauthorized) NotConnected The Bearer Token is missing
 * @apiError (401 Unauthorized) NotABearerToken Not a Bearer Token in header
 * @apiError (401 Unauthorized) InvalidToken The token in the header is invalid or expired
 * @apiError (403 Forbidden) NotAllowed The user is not an admin
 **/
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
        res.status(200).send(updatedSpot);
      })
    } else {
      res.status(403).send("You don't have the rights to do that")
    }
  })

})

export default router;