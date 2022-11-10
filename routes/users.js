import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/User.js"
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
    res.send(user)
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

//Login
router.post("/login", function(req, res, next) {
  User.findOne({ userName: req.body.userName }).exec(function(err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return res.sendStatus(401);
    }
    bcrypt.compare(req.body.password, user.password, function(err, valid) {
      if (err) {
        return next(err);
      } else if (!valid) {
        return res.sendStatus(401);
      }
      // Login is valid...
      res.send(`Welcome ${user.userName}!`);
    });
  })
});

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

///////////////////////////////////////////PUT
router.put("/:id", function (req, res, next) {

})

export default router;
