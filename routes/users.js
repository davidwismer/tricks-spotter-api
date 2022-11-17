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
 * @apiSuccess {Object[]} users List of users
 */
router.get("/", function (req, res, next) {
  User.find().count(function (err, total) { //To paginate the users
    if (err) {
      return next(err);
    }
    let query = User.find().sort({creationDate: -1})
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

    query.exec(function (err, users) {
      if (err) {
        return next(err);
      }
      res.send({
        data: users,
        page: page,
        pageSize: pageSize,
        total: total
      })
    })
  });
});

//Get user by id
/**
 * @api {get} /users/:id Request a user's information
 * @apiName GetUser
 * @apiGroup User
 * 
 * @apiParam {String} UserId id Unique identifier of the user
 * 
 * @apiSuccess {Object[]} UserById the user with the given id
 */
router.get("/:id", function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    res.send(user)
  })
});

//Get all the tricks of a user
/**
 * @api {get} /users/:id/tricks Request all the tricks of a user
 * @apiName GetUserTricks
 * @apiGroup User
 * 
 * @apiParam {String} UserId id Unique identifier of the user
 * 
 * @apiSuccess {Object[]} UserTricks tricks of the user with the given id
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
      let query = Trick.find({ userId: req.params.id }).sort({creationDate: -1})
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
})

///////////////////////////////////////////POST
//Create new user
/**
 * @api {post} /users to create a new user
 * @apiName PostUser
 * @apiGroup User
 * 
 * @apiParam {Boolean} Admin is the user an admin or not 
 * @apiParam {String} firstName firstName of the user
 * @apiParam {String} lastName lastName of the user
 * @apiParam {String} userName userName of the user
 * 
 * @apiSuccess {Object[]} NewUser creation of new user
 */
router.post("/", function (req, res, next) {
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
      res.send(savedUser)
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
 * @apiParam {String} UserId id Unique identifier of the user 
 * 
 * @apiSuccess {Object[]} DeletedUser the deleted user 
 */
router.delete("/:id", authenticate, function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in we delete it
    if (req.params.id == req.currentUserId) {
      User.findByIdAndDelete({ _id: req.params.id }).exec(function (err, removedUser) {
        if (err) {
          return next(err)
        }
        res.send(removedUser)
      })
    } else {
      res.send("Don't have the rights to do that")
    }
  })
})

///////////////////////////////////////////PUT
/**
 * @api {put} /users/:id to modify a user
 * @apiName ModifyUser
 * @apiGroup User
 * 
 * @apiParam {String} UserId id Unique identifier of the user 
 * 
 * @apiSuccess {Object[]} UpdatedUser Updated user
 */
router.put("/:id", authenticate, function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in we update it
    if (req.params.id == req.currentUserId) {
      User.findByIdAndUpdate({ _id: req.params.id }, {
        admin: req.body.admin,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        password: req.body.password
      }, { new: true, runValidators: true }).exec(function (err, updatedUser) {
        if (err) {
          return next(err);
        }
        res.send(updatedUser);
      })
    } else {
      res.send("Don't have the rights to do that")
    }
  })
})


//Delete all for tests ON DOIT EFFACER CA AVANT DE RENDRE
router.delete("/", function (req, res, next) {
  console.log("wtf")
  User.deleteMany().exec(function (err, users) {
    if (err) {
      return next(err)
    }
    res.send("all deleted")
  })
})

export default router;