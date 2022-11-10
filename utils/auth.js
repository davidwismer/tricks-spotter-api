import { User } from "../model/User.js";
import jwt from "jsonwebtoken"
import * as dotenv from 'dotenv'
dotenv.config()
const secretKey = process.env.SECRET_KEY

function authenticate(req, res, next) {
    // Ensure the header is present.
    const authorization = req.get("Authorization");
    if (!authorization) {
        return res.status(401).send("Authorization header is missing");
    }
    // Check that the header has the correct format.
    const match = authorization.match(/^Bearer (.+)$/);
    if (!match) {
        return res.status(401).send("Authorization header is not a bearer token");
    }
    // Extract and verify the JWT.
    const token = match[1];
    jwt.verify(token, secretKey, function (err, payload) {
        if (err) {
            return res.status(401).send("Your token is invalid or has expired");
        } else {
            req.currentUserId = payload.sub;
            next(); // Pass the ID of the authenticated user to the next middleware.
        }
    });
}

export default authenticate