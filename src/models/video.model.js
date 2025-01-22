import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new mongoose.Schema({

  videoFile:{
      type:String,  //cloudinary url se lenge
      required:true
  },
  thumbnail:{
    type:String,  //cloudinary url se lenge
      required:true
  },
  title:{
    type:String,  
      required:true
  },
  description:{
    type:String,  
      required:true
  },
  duration:{
    type:Number,    //duration is give by cloudinary it will tell the tim eof video to us
      required:true
  },
  views:{
    type:Number,
      default:0,
  },
  isPublished:{
    type:Boolean,
    default:true
  },
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  }

},{timestamps:true})
videoSchema.plugin(mongooseAggregatePaginate)
 export const Video=mongoose.model("Video",videoSchema)

