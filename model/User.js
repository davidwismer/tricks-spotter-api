import mongoose, { Schema, model } from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';

//create the user schema
let userSchema = new Schema({
    id: {
        type: mongoose.ObjectId
    },
    admin: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: [true, 'You must provide a name!'],
        maxLength: 20,
        minLength: 3
    },
    lastName: {
        type: String,
        required: [true, 'You must provide a lastname!'],
        maxLength: 20,
        minLength: 3
    },
    userName: {
        type: String,
        required: [true, 'You must provide a username!'],
        maxLength: 20,
        minLength: 3,
        unique: true
    },
    password: {
        type: String,
        required: [true, 'You must provide a password!'],
        minLength: 3
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
})

//To create custom message for unique violation
userSchema.plugin(uniqueValidator, { message: `{PATH} is already taken`});

//Hide the hashed password and _v to the api users
userSchema.set("toJSON", {
    transform: transformJsonUser
});
function transformJsonUser(doc, json, options) {
    // Remove the hashed password and _v from the generated JSON.
    delete json.password;
    delete json.__v;
    return json;
}

//create model and export it
export const User = model('User', userSchema)