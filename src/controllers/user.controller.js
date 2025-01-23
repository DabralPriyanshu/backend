import { User} from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens=async(userId)=>{
   try{
       const user =await User.findById(userId)
       const accessToken=  user.generateAccessToken()
       const refreshToken=user.generateRefreshToken()
       user.refreshToken=refreshToken; // adding the refrsh token in user 
       await user.save({validateBeforeSave:false})   //as before saving password is require so we are using validate before save
       return {accessToken,refreshToken}; //returning the object of both
     
   }catch{
    throw new ApiError(500,"Internal server Error")
   }
}

const registerUser= asyncHandler(async(req,res)=>{
   // get user details from frontend
   // validation
   // check if user exits: username /email
   //check for images ,check for avtar
   //upload them to cloudinary,avatar
   // create user object -create entry in db
   // remove password and refresh token field from response
   // check for response if created return response else error
     
   const {fullname,email,password,username}=req.body
 if(
    [fullname,email,username,password].some((field)=> field?.trim()=== "")
   )
 {
    throw new ApiError(400,"All fields are required");
 }
  const existedUser= await User.findOne({
    $or:[{username} , {email }]
  })
  if(existedUser)
  {
    throw new ApiError(409,"User with email or username already exists")
  }
   const avatarLocalPath=  req.files?.avatar[0]?.path              //multer has uploaded the file and we are taking the path
    //const  coverImageLocalPath= req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0)
    {
        coverImageLocalPath= req.files?.coverImage[0].path    
    }

   if(!avatarLocalPath)
   {
     throw new ApiError(400,"Avatar file is required")
   }
   const avatar= await uploadOnCloudinary(avatarLocalPath)
   const coverImage=await uploadOnCloudinary(coverImageLocalPath) //if cover image not given it will return an empty string
   if(!avatar)
   {
    throw new ApiError(400,"Avatar file is required")
   }
  const user=  await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()

    })
    const createdUser= await User.findById(user._id).select(  //ye response me ye dono nahi dega if user created hai
        "-password -refreshToken"
    )
    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
})
const loginUser=asyncHandler(async(req,res)=>{
  //todos
  1 // data from req.body
  2 // ..username or password
  3// ..find the user
  4//check password
  //5 provide access and refresh token
  //6 send cookie
  const {email,username,password}=req.body;
  if(!username && !email)
  {
    throw new ApiError(400,"Username or email is require")
  }
  const user= await User.findOne({ $or:[{username},{email}]})
  if(!user)
  {
    throw new ApiError(404,"User not found")
  }
  const isPasswordValid=await user.isPasswordCorrect(password);
  if(!isPasswordValid)
  {
    throw new ApiError(401,"Invalid user credentials")
  }
  const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id);
  const loggedInUser=await  User.findById(user._id).select("-password -refreshToken")
  const option={
    httpOnly:true,
    secure:true,
  }
  return res.status(200).cookie("accessToken",accessToken,option).cookie("refreshToken",refreshToken,option).json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in Successfully"))

}
)
const logOutUser=asyncHandler(async(req,res)=>{
  const user=req.user._id;
  await User.findByIdAndUpdate(user,{
    $set:{
      refreshToken:undefined
    }
  },{
    new:true    //return the new response with updated value as have updated refreshtoken
  })
  const option={
    httpOnly:true,
    secure:true,
  }
  return res.status(200).clearCookie("accessToken",option).clearCookie("refreshToken",option).json(new ApiResponse(200,{},"User logged out"))


})
const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken;
  if(!incomingRefreshToken)
  {
    throw new ApiError(401,"Unauthorized request")
  }
  try {
    const decoded= jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user= await User.findById(decoded?._id)
    (!user)
    {
      throw new ApiError(401,"Invalid RefreshToken")
    }
    if(incomingRefreshToken!==user?.refreshToken)
    {
      throw new ApiError(401,"RefreshToken is Expired")
    }
    const option={
      httpOnly:true,
      secure:true
    }
     const {accessToken,newRefreshToken} =await generateAccessAndRefreshTokens(user._id)
      res.status(200).cookie("accessToken",accessToken,option).cookie("newRefreshToken",newRefreshTokene,option).json(new ApiResponse(200,{accessToken,newRefreshToken},"Access Token Refresh"))
  }  
  catch (error) {
    throw new ApiError(401,error?.message || "Invalid refreshToken")
  }
})
const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body;
  const user=await User.findById(req.user?._id)
  if(!user)
  {
    throw new ApiError(404,"User not found")
  }
  const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect)
  {
    throw new ApiError(404,"Invalid password")
  }
  user.password=newPassword;
  await user.save({validateBeforeSave:false});
  return res.status(200).json(new ApiResponse(200,{},"Password Changed successfully"))
})
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,
      {user:req.user},"Current User fetched successfully"))
})
const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body;
  if(!fullname ||!email)
  {
    throw new ApiError(400,"All fields are required")
  }
  const user=await User.findById(req.user?._id)
  if(!user)
  {
    throw new ApiError(404,"User not found")
  }
 const updatedUser=User.findByIdAndUpdate(req.user?._id,{
   $set:{
    fullname:fullname,
    email:email,
   }
 },
  {new:true}
 ).select("-password -refreshToken")
 return res.status(200).json( new ApiResponse(200,{updatedUser},"Account detials updated successfully"))
})
const updateUserAvatar=asyncHandler(async(req,res)=>{
  const  avatarLocalPath=req.file?.path;  
   //as we only want avatar so file
   if(!avatarLocalPath)
   {
    throw new ApiError(400,"Avatar file required")
   }
   const avatar= await uploadOnCloudinary(avatarLocalPath)
   if(!avatar.url)
   {
    throw new ApiError(400,"Error while uploading avatar")
   }

 const user=  await User.findByIdAndUpdate(req.user?._id,
    {
    $set:{
      avatar:avatar.url
    }
    },{
      new:true
    }
   ).select("-password")
  return res.status(200).json(new ApiResponse(200,{user},"Avatar updated successfully"))
})
const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const  coverImageLocalPath=req.file?.path;  
   //as we only want avatar so file
   if(!coverImageLocalPath)
   {
    throw new ApiError(400,"Cover Image file required")
   }
   const coverImage= await uploadOnCloudinary(coverImageLocalPath)
   if(!coverImage.url)
   {
    throw new ApiError(400,"Error while uploading cover image")
   }

 const user=  await User.findByIdAndUpdate(req.user?._id,
    {
    $set:{
      coverImage:coverImage.url
    }
    },{
      new:true
    }
   ).select("-password")
  return res
  .status(200)
  .json
  (new ApiResponse(200,{user},"Cover Image updated successfully"))
})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar
}