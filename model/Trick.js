import mongoose, { Schema, model } from "mongoose";

//create the user schema
let trickSchema = new Schema({
    
})

//create model and export it
export const Trick = model('Trick', trickSchema)