const cloudinary = require('../config/cloudinary')


const cloudinaryImgUpload = async(req, res)=>{

       console.log('clouding get requst');
       
     try {
       const timestamp = Math.round(new Date().getTime()/1000)
       const uploadPreset=process.env.CLOUDINARY_PRESET_NAME

       const stringToSign = `timestamp=${timestamp}&upload_preset=${uploadPreset}`;
       console.log( process.env.CLOUDINARY_API_KEY,);
       

       const signature = cloudinary.utils.api_sign_request(
         {
          timestamp, 
          upload_preset:uploadPreset
        },  
          process.env.CLOUDINARY_API_SECRET        
       )
       
        res.status(200).json({
          signature,
          timestamp,
          uploadPreset:uploadPreset,
          apiKey: process.env.CLOUDINARY_API_KEY,
          cloudName:process.env.CLOUDIANRY_NAME
        })
     } catch (error) {
      console.error('Error generating Cloudinary signature:', error);
       res.status(500).json({message:'cloudinery config failed'})
     }

        
}
module.exports = {
  cloudinaryImgUpload
}