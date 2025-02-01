// import axioInstence from "../utils/axioInstence";
import React from 'react';
import axios from "axios";

  const uploadImageToCloudinary = async (files)=>{
     try {
       const {data} = await axios.get('https://backend.abeltomy.site/admin/generate-upload-url')
       const {signature, timestamp, uploadPreset,apiKey,cloudName}=data
       
       

          const imageUrls=[];

          for(const file of files) {
             

            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset',uploadPreset)
            formData.append('timestamp',timestamp)
            formData.append('signature', signature)
            formData.append('api_key', apiKey); 
 
            const response = await axios.post(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              formData
            )
            console.log('Image uploaded successfully', response.data.secure_url)
            imageUrls.push(response.data.secure_url)

          } 
            
           return imageUrls
     } catch (uploadError) {
        console.error('Error uploading individual image:', uploadError.response ? uploadError.response.data : uploadError.message);
     }
  }


  export default uploadImageToCloudinary