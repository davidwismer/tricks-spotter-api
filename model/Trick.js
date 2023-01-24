import mongoose, { Schema, model } from "mongoose";

//create the trick schema
let trickSchema = new Schema({
    id: {
        type: mongoose.ObjectId
    },
    name: {
        type: String,
        required: [true, 'You must provide a name!'],
        maxLength: 30,
        minLength: 3
    },
    video: {
        type: String,
        required: [true, 'You must provide a video!']
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    spotId: {
        type: mongoose.ObjectId,
        required: [true, 'You must provide a spotId!']
    },
    userId: {
        type: mongoose.ObjectId,
        required: [true, 'You must provide a userId!']
    },
})

//Hide the _v to the api users
trickSchema.set("toJSON", {
    transform: transformJsonTrick
});

function transformJsonTrick(doc, json, options) {
    // Remove the _v from the generated JSON.
    delete json.__v;
    return json;
}

//create model and export it
export const Trick = model('Trick', trickSchema)