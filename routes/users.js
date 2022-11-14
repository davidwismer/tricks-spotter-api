import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/User.js"
import { Trick } from "../model/Trick.js";
import authenticate from "../utils/auth.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all users
router.get("/", function (req, res, next) {
  User.find().count(function (err, total) { //To paginate the users
    if (err) {
      return next(err);
    }
    let query = User.find()
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
router.get("/:id", function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    res.send(user)
  })
});

//Get all the tricks of a user
router.get("/:id/tricks", function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    Trick.find({ userId: req.params.id }).count(function (err, total) { //To Paginate the tricks
      if (err) {
        return next(err);
      }
      let query = Trick.find({ userId: req.params.id })
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
    })
  })
})

///////////////////////////////////////////POST
//Create new user
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
router.put("/:id", authenticate, function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in we update it
    if (req.params.id == req.currentUserId) {
      User.findByIdAndUpdate({ _id: req.params.id }, {
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

export default router;