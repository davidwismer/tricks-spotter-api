import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/User.js"
import { Trick } from "../model/Trick.js";
const router = express.Router();

//////////////////////////////////////////GET
//get all users
router.get("/", function (req, res, next) {
  User.find().sort('userName').exec(function (err, users) {
    if (err) {
      return next(err);
    }
    res.send(users);
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
    Trick.find({ userId: req.params.id }).exec(function (err, tricks) {
      res.send(tricks)
    })
  })
});

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
router.delete("/:id", function (req, res, next) {
  User.findByIdAndRemove({ _id: req.params.id }).exec(function (err, removedUser) {
    if (err) {
      return next(err)
    }
    res.send(removedUser)
  })
})

///////////////////////////////////////////PUT
router.put("/:id", function (req, res, next) {
  User.findByIdAndUpdate({ _id: req.params.id }, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    password: req.body.password
  }).exec(function (err, updatedUser) {
    if (err) {
      return next(err);
    }
    res.send(updatedUser);
  })
})

export default router;
