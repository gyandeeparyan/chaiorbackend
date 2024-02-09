import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js' 

const registerUser =asyncHandler( async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists : username ,email 
    // check for images,check for avatar
    // upload them to cloudinary ,avtar 
    // create user Object - create entry in db
    // remove password and refresh token field from response 
    // chechk for user creation 
    // return res
    
    const {fullName,email,username,password} = req.body 
    console.log("EMAIL :", email); 

    if([fullName,email,username,password].some((field)=>field?.trim() === "")) {
        
        throw new ApiError(400,"ALL FIELDS  IS REQUIRED ")

    }


   const existedUser = User.findOne({
        $or : [ {username} , {email}]
    })
    if (existedUser){
        throw new ApiError(409,"USER WITH EMAIL OR USERNAME ALREADY EXSISTED ")
    }
     
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
throw new ApiError(400,"AVATAR FILE IS REQUIRED")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImage)
    if(!avatar){
        throw new ApiError(409,"AVATAR NOT EXSISTED ")
    }
    
   const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"SOMETHING WENT WRONG WHILE REGISTERIING THE USER")
    }

    return res.status(201).json(new ApiResponse(200,createdUser,"USER REGISTERED SUCCESFULLY"))
    console.log(createdUser);

})


export {registerUser}