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
        type: [Number],
        required: true,
        validate: {
            validator: validateGeoJsonCoordinates,
            message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
        }
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

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
    return Array.isArray(value) && value.length >= 2 && value.length <= 3 && isLongitude(value[0]) && isLatitude(value[1]);
}

function isLatitude(value) {
    return value >= -90 && value <= 90;
}

function isLongitude(value) {
    return value >= -180 && value <= 180;
}