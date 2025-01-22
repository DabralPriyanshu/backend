import mongoose from "mongoose";
const subscriptionSchema=new mongoose.Schema({

 subscriber:{
    type:Schema.Types.ObjectId,   //one who is subscribing
    ref:"User"
 },
 channel:{
    type:Schema.Types.ObjectId,   //channel is also a user like priyanshudabral  user of youtube he has an channel
    ref:"User"
 }
},{timestamps:true});
 export const Subscription=mongoose.model("Subscription",subscriptionSchema);