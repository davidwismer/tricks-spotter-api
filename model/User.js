import mongoose, { Schema, model } from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';

//create the user schema
let userSchema = new Schema({
    id: {
        type: mongoose.ObjectId
    },
    firstName: {
        type: String,
        required: [true, 'You must provide a name!']
    },
    lastName: {
        type: String,
        required: [true, 'You must provide a lastname!']
    },
    userName: {
        type: String,
        required: [true, 'You must provide a username!'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'You must provide a password!']
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
})

//To create custom message for unique violation
userSchema.plugin(uniqueValidator, { message: `{PATH} is already taken` });

//Hide the hashed password to the api users
userSchema.set("toJSON", {
    transform: transformJsonUser
});
function transformJsonUser(doc, json, options) {
    // Remove the hashed password from the generated JSON.
    delete json.password;
    return json;
}

//create model and export it
export const User = model('User', userSchema)