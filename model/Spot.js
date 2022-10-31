import mongoose, { Schema, model } from "mongoose";

//create the user schema
let spotSchema = new Schema({
    id: {
        type: mongoose.ObjectId
    },
    name: {
        type: String,
        required: [true, 'You must provide a name']
    },
    description: {
        type: String,
        required: [true, 'You must provide a description']
    },
    category: {
        type: String,
        required: [true, 'You must provide a category']
    },
    geolocation: {

    },
    picture: {

    },
    rating: {

    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    lastModifDate: {

    }
})

//create model and export it
export const Spot = model('Spot', spotSchema)