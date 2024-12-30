
import dotenv from "dotenv"
// import mongoose from "mongoose";
// import {DB_NAME} from "./constants.js"
import connectDB from "./db/index.js";
// dotenv.config({path:'./env'})
dotenv.config()
connectDB()
// //data base connection

// (async()=>{
// try{
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
// }
// catch(error)
// {
// console.error("ERROR:",error)
// throw error
// }
// })()