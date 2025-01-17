import mongoose from "mongoose";
import{DB_NAME} from "../constants.js"
import dotenv from "dotenv"
dotenv.config()

//database connection
const connectDB=async()=>{
    try{
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    //    console.log(connectionInstance)
       console.log(`\n MongoDB connected !! DB host ${connectionInstance.connection.host}`)
    }
    catch(error)
    {
     console.log("MONGODB connection error",error);
     process.exit(1)
    }
}
export default connectDB;