import mongoose, { Schema, model } from "mongoose";

//create the trick schema
let trickSchema = new Schema({
    id: {
        type: mongoose.ObjectId
    },
    name: {
        type: String,
        required: [true, 'You must provide a name!']
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

//create model and export it
export const Trick = model('Trick', trickSchema)