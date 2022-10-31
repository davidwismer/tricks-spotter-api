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
    creationDate: {
        type: Date,
        default: Date.now
    },
    LastModificationDate: {
        type: Date,
        default: Date.now
    },
    spotId: {
        type: String,
        required: [true, 'You must provide a name!']
    },
    userId: {
        type: String,
        required: [true, 'You must provide a name!']
    },
})

//create model and export it
export const Trick = model('Trick', trickSchema)