
import fs from "fs"
import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME , 
  api_key:process.env.CLOUDINARY_API_KEY , 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});



const uploadOnCloudinary=async(localFilePath)=>{

try {
   if(!localFilePath) return null  

  const response =await cloudinary.uploader.upload(localFilePath,{
    resource_type:"auto",
   })

   //file uploaded successfully
   console.log("FILE IS UPLOADED ON CLOUDINARY");
   //log response of cloudinary
   console.log( "CLOUDINARY RESPONSE -------------->> ", response);
   fs.unlinkSync(localFilePath)
   return response

} catch (error) {
    fs.unlinkSync(localFilePath)// remove the locally saved temp file as the file upload got failed
    return null
}

}

export {uploadOnCloudinary}