import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/User.js"
const router = express.Router();
const secretKey = process.env.SECRET_KEY

//Login
router.post("/", function (req, res, next) {
    User.findOne({ userName: req.body.userName }).exec(function (err, user) {
        if (err) {
            return next(err);
        } else if (!user) {
            return res.sendStatus(401);
        }
        //Validate the password with bcrypt
        bcrypt.compare(req.body.password, user.password, function (err, valid) {
            if (err) {
                return next(err);
            } else if (!valid) {
                return res.sendStatus(401);
            }
            //Generate a valid JWT that expires in 7 days
            const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600
            const payload = { sub: user._id.toString(), exp: exp }
            jwt.sign(payload, secretKey, function (err, token) {
                if (err) {
                    return next(err)
                }
                res.send({ token: token })
            })
        });
    })
});

export default router