import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const  generateAccessAndRefreshTokens =async (userId) =>{
    try {

        const user =await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        
        user.refreshToken=refreshToken
        user.save({validateBeforeSave:false})
        
        return {accessToken , refreshToken } 

    } catch (error) {
        throw new ApiError(500,"SOMETHING WENT WRONG WHILE GENERATING REFRESH AND ACCESS TOKEN")
    }
}

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists : username ,email
  // check for images,check for avatar
  // upload them to cloudinary ,avtar
  // create user Object - create entry in db
  // remove password and refresh token field from response
  // chechk for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  console.log("REQUEST . BODY", req.body); //study req.body data format

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "ALL FIELDS  IS REQUIRED ");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "USER WITH EMAIL OR USERNAME ALREADY EXSISTED ");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  console.log("REQ . FILES", req.files);
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "AVATAR FILE IS REQUIRED");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(409, "AVATAR NOT EXSISTED ");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "SOMETHING WENT WRONG WHILE REGISTERIING THE USER");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "USER REGISTERED SUCCESFULLY"));
  console.log(createdUser);
});

// login code

// get data from ->req.body
// username || email
// find user
// check password
// give access token and refresh token
// send cookie

const loginUser = asyncHandler(async (req,res)=>{

    const {username,email,password} =req.body

    if( !username || !email) 
    {
    throw new ApiError(400,"USERNAME OR EMAIL IS NEEDED")
    }
    
    const user = await User.findOne({
    
        $or:[{username},{email}]
    
    })
    
    if (!user) 
    {
    throw new ApiError(404,"USER DOES NOT EXSIST")
    }
    
    
    
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid){
        throw new ApiError(401,"INVALID USER CREDENTIALS")
    }
    
    
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id).select("-password -refreshToken")
    
    const options={
        httpOnly:true,
        secure: true ,
    }
    
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
            },
            "USER LOGGED IN SUCCESSFULLY"
        )
    )
    
    const loggedInUser =await User.findById(user._id)

})


const logoutUser=asyncHandler(async (req,res)=>{
    //clear cookies
    
    await User.findByIdAndUpdate(req.user._id,
        {
        $set:{
            refreshToken:undefined,
        }
    },
    {
        new : true 
    },

    
    )

    const options={
        httpOnly:true,
        secure: true ,
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"USER LOGGED OUT"))
})



export { registerUser ,loginUser,logoutUser  };
