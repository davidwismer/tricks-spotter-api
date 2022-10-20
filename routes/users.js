import express from "express";
import bcrpyt from "bcrypt";
import { User } from "../model/User.js"
//import { User } from "../model/User";
const router = express.Router();

//////////////////////////////////////////GET
//get all users
router.get("/", function (req, res, next) {
  User.find().sort('name').exec(function (err, users) {
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

///////////////////////////////////////////POST
//Create new user
router.post("/", function (req, res, next) {
  //To hash the password
  const plainPassword = req.body.password;
  const costFactor = 10;
  bcrpyt.hash(plainPassword, costFactor, function (err, hashedPassword) {
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
  User.findOneAndRemove({ _id: req.params.id }).exec(function (err, removedUser) {
    if (err) {
      return next(err)
    }
    res.send(removedUser)
  })
})

export default router;
