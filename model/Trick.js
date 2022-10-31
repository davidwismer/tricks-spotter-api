import mongoose, { Schema, model } from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';

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
    spotid: {
        type: String,
        required: [true, 'You must provide a name!']
    },
    userid: {
        type: String,
        required: [true, 'You must provide a name!']
    },
})

//create model and export it
export const Trick = model('Trick', trickSchema)