import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/User.js"
import { Trick } from "../model/Trick.js";
import authenticate from "../utils/auth.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all users
/**
 * @api {get} /users Request a list of the users
 * @apiName GetUsers
 * @apiGroup User
 * 
 * @apiQuery {Number} pageSize The number of element to show on a page (pagination)
 * @apiQuery {Number} page The page number that you want to show (pagination)
 *
 * @apiSuccess {Object[]} users List of users
 * @apiSuccess {Boolean} users.admin Role of the users
 * @apiSuccess {String} users.firstName Firstname of the users
 * @apiSuccess {String} users.lastName Lastname of the users
 * @apiSuccess {String} users.userName Username of the users
 * @apiSuccess {String} users.creationDate Creation date of the users
 * @apiSuccess {String} users._id Id of the users
 * @apiSuccess {Number} users.tricksPosted Number of tricks the users posted
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 200 OK
 *[
    {
        "admin": false,
        "firstName": "Jean",
        "lastName": "Do",
        "userName": "jeando",
        "creationDate": "2022-11-20T15:05:20.254Z",
        "_id": "637a42301497883f834a5caa",
        "tricksPosted": 0
    }
]
 */
router.get("/", function (req, res, next) {
  User.find().count(function (err, total) { //To paginate the users
    if (err) {
      return next(err);
    }
    const maxPage = 10

    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
      page = 1
    }

    let pageSize = parseInt(req.query.pageSize, 10);
    if (isNaN(pageSize) || pageSize < 0 || pageSize > maxPage) {
      pageSize = maxPage;
    }

    //Aggregation, get number of tricks posted by users
    User.aggregate([
      {
        $lookup: {
          from: 'tricks',
          localField: '_id',
          foreignField: 'userId',
          as: 'tricksPosted'
        }
      },
      {
        $unwind: {
          path: '$tricksPosted',
          preserveNullAndEmptyArrays: true //To keep also the users who didn't post any tricks
        }
      },
      {
        $addFields: {
          tricksPosted: {
            $cond: {
              if: '$tricksPosted',
              then: 1,
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          admin: { $first: '$admin' },
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          userName: { $first: '$userName' },
          creationDate: { $first: '$creationDate' },
          tricksPosted: { $sum: '$tricksPosted' }
        }
      },
      {
        $sort: {
          creationDate: -1
        }
      },
      {
        $skip: (page - 1) * pageSize
      },
      {
        $limit: pageSize
      }
    ], function (err, users) {
      if (err) {
        return next(err);
      }
      res.status(200).send(users.map(user => {
        const serialized = new User(user).toJSON() //Transform user to Mongoose model
        serialized.tricksPosted = user.tricksPosted //Add the aggregated property
        return serialized
      }))
    })
  });
});

//Get user by id
/**
 * @api {get} /users/:id Request a user's information
 * @apiName GetUser
 * @apiGroup User
 * 
 * @apiParam {String} id The unique id that identifies a user
 * 
 * @apiSuccess {Boolean} admin Role of the user
 * @apiSuccess {String} firstName Firstname of the user
 * @apiSuccess {String} lastName Lastname of the user
 * @apiSuccess {String} userName Username of the user
 * @apiSuccess {String} creationDate Creation date of the user
 * @apiSuccess {String} _id Id of the user 
 * 
 * @apiSuccessExample {json} Succes-Response:
 * HTTP/1.1 200 OK
 * {
    "_id": "637a5cbd9ecaf7a831f52b3d",
    "admin": false,
    "firstName": "Jon",
    "lastName": "Do",
    "userName": "jondo",
    "creationDate": "2022-11-20T16:58:37.601Z"
}
 */
router.get("/:id", function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    res.status(200).send(user)
  })
});

//Get all the tricks of a user
/**
 * @api {get} /users/:id/tricks Request all the tricks of a user
 * @apiName GetUserTricks
 * @apiGroup User
 * 
 * @apiParam {String} id The unique id that identifies a user
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
        data: [
          {
            _id: '637a61912e03c1b8f403b973',
            name: 'nose slide',
            video: 'video.mp4',
            creationDate: '2022-11-19T18:31:44.268Z',
            spotId: '637a61912e03c1b8f403b970',
            userId: '637a61912e03c1b8f403b964'
          },
          {
            _id: '637a61912e03c1b8f403b972',
            name: 'board slide',
            video: 'video.mp4',
            creationDate: '2022-11-18T18:31:44.268Z',
            spotId: '637a61912e03c1b8f403b970',
            userId: '637a61912e03c1b8f403b964'
          }
        ],
        page: 1,
        pageSize: 10,
        total: 2
      }
 */
router.get("/:id/tricks", function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    Trick.find({ userId: req.params.id }).count(function (err, total) { //To Paginate the tricks
      if (err) {
        return next(err);
      }
      let query = Trick.find({ userId: req.params.id }).sort({ creationDate: -1 })
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
})

///////////////////////////////////////////POST
//Create new user
/**
 * @api {post} /users to create a new user
 * @apiName PostUser
 * @apiGroup User
 * 
 * @apiBody {Boolean} Admin is the user an admin or not 
 * @apiBody {String} firstName firstName of the user
 * @apiBody {String} lastName lastName of the user
 * @apiBody {String} userName userName of the user
 * 
 * @apiSuccess {Object[]} NewUser creation of new user
 */
router.post("/", async function (req, res, next) {
  //To hash the password
  const plainPassword = req.body.password;
  const costFactor = 10;
  bcrypt.hash(plainPassword, costFactor, function (err, hashedPassword) {
    if (err) {
      return next(err)
    }
    //Get the user created
    const newUser = new User(req.body)
    //Change the password entry of the user to the hashed one
    newUser.password = hashedPassword;
    //save new user created
    newUser.save(function (err, savedUser) {
      if (err) {
        return next(err)
      }
      res.status(201).send(savedUser)
    })
  })
})

////////////////////////////////////////////DELETE
//Delete user by id
/**
 * @api {delete} /users/:id to delete a user
 * @apiName DeleteUser
 * @apiGroup User
 * 
 * @apiParam {String} id The unique id that identifies a user 
 * 
 * @apiSuccess {Object[]} DeletedUser the deleted user 
 */
router.delete("/:id", authenticate, function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in, or if he is an admin we delete it
    if (req.params.id == req.currentUserId) {
      User.findByIdAndDelete({ _id: req.params.id }).exec(function (err, removedUser) {
        if (err) {
          return next(err)
        }
        res.status(200).send(removedUser)
      })
    } else {
      res.status(403).send("Don't have the rights to do that")
    }
  })
})

///////////////////////////////////////////PUT
/**
 * @api {put} /users/:id to modify a user
 * @apiName ModifyUser
 * @apiGroup User
 * 
 * @apiParam {String} id The unique id that identifies a user 
 * 
 * @apiSuccess {Object[]} UpdatedUser Updated user
 */
router.put("/:id", authenticate, function (req, res, next) {
  //User can update his own profile or another if he is admin
  User.findOne({ _id: req.params.id }).exec(async function (err, user) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in he can update his profile (can't change the role)
    if (req.params.id == req.currentUserId) {
      //Hash the new password
      let modif = req.body
      if (req.body.password !== 'undefined') {
        const plainPassword = req.body.password || '';
        const costFactor = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, costFactor)
        modif.password = hashedPassword
      }
      await User.findByIdAndUpdate({ _id: req.params.id }, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        password: modif.password
      }, { new: true, runValidators: true }).exec(function (err, updatedUser) {
        if (err) {
          return next(err);
        }
        res.status(200).send(updatedUser)
      })
    } else {
      //If this is not the current user connected's profile, but he is an admin, he can grant the admin role to the user.
      User.findOne({ _id: req.currentUserId }).exec(function (err, user) {
        if (err) {
          return next(err)
        }
        if (user.admin) {
          User.findByIdAndUpdate({ _id: req.params.id }, {
            admin: req.body.admin
          }, { new: true, runValidators: true }).exec(function (err, updatedUser) {
            if (err) {
              return next(err);
            }
            res.status(200).send(updatedUser);
          })
        } else {//This is not an admin, but he tries to modify somebody elses profile
          res.status(403).send("Don't have the rights to do that")
        }
      })
    }
  })
})

export default router;