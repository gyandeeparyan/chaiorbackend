//require('dotenv'.config({path:'./env'}))
import dotenv from "dotenv";
import { app } from "./app.js";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js ";
import connectDB from "./db/index.js";

/*import express from "express";

const app=express()

(async()=>{
    try {
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{console.error("err",error);throw error})
        app.listen(process.env.PORT,()=>{
            console.log(`SERVER IS LISTENING ON PORT ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR",error);
    }
})()
*/
dotenv.config({
  path: "./env",
});
connectDB()
.then(
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`SERVER IS RUNNING AT PORT${process.env.PORT}`);
    })
)
.catch((err)=>{
    console.log("MONGO DB CONNECTION FAILED",err);
});
