import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/User.js"
const router = express.Router();
const secretKey = process.env.SECRET_KEY

//Login
/**
 * @api {post} /login Login to existing account
 * @apiName Login
 * @apiGroup Login
 * 
 * @apiBody (Request body) {String} userName The userName of the account you want to connect with
 * @apiBody (Request body) {String} password The password of the account you want to connect with
 * 
 * @apiSuccess {Object[]} token The valid token for authentification of user
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MzdhNDIzMDE0OTc4ODNmODM0YTVjYWEiLCJleHAiOjE2Njk1NjcyMzAsImlhdCI6MTY2ODk2MjQzMH0.PvQH17ZXt1PggE1MgNYhBKD70aJ9ienZIIZOPSN7etw"
 *     }
 * 
 * @apiError (401 Unauthorized) UserNotFound The userName you provided doesn't exist
 * @apiError (401 Unauthorized) WrongPassword The password you provided is wrong
 */
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
                res.status(200).send({ token: token, user: user })
            })
        });
    })
});

export default router