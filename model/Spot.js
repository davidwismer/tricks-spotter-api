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
        type: String,
        required: [true, 'You must provide a geolocation']
    },
    picture: {
        type: String,
        required: [true, 'You must provide a picture']
    },
    rating: {
        type: Number,
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    lastModifDate: {
        type: Date,
        default: Date.now
    }
})

//create model and export it
export const Spot = model('Spot', spotSchema)