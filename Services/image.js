const processFile = require("../Middlewares/multer");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
const { resolve } = require("path");
// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("pillo_app");

const uploadSingleImage = async(req, res, path)=>{
        try {

            if (!req.file) {
              return('Please upload a file.');
            }


            // Create a new blob in the bucket and upload the file data.
            const blob = bucket.file(`${path}/${formatURL(req.file.originalname)}`);
            const blobStream = blob.createWriteStream({
              resumable: false,
            });
        
            blobStream.on("error", (err) => {
              return(err.message);
            });

            let publicUrl  = format(
              `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );

            blobStream.on("finish", async (data) => {
              // Create URL for directly file access via HTTP.
              
        
              try {
                // Make the file public
                await bucket.file(`${path}/${formatURL(req.file.originalname)}`).makePublic();
              } catch {
                return res.status(500).send({
                  message:
                    `Uploaded the file successfully: ${formatURL(req.file.originalname)}, but public access is denied!`,
                  url: publicUrl,
                });
              }
        
            });
        
            blobStream.end(req.file.buffer);
            
            return publicUrl;

          } catch (err) {
            if (err.code == "LIMIT_FILE_SIZE") {
              return("File size cannot be larger than 2MB!")
              }
              return(`Could not upload the file. ${err}`);
          }
    
}

const uploadMultipleImages = async (files, path)=>{
      
      try {
          
          if (!files) {
            return false
          }
          
          let publicUrls = []

          files.forEach(file =>{
            
            // Create a new blob in the bucket and upload the file data.
            const blob = bucket.file(`${path}/${formatURL(file.originalname)}`);
            const blobStream = blob.createWriteStream({
              resumable: false,
            });
        
            // Create URL for directly file access via HTTP.
            const publicUrl = format(
              `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            );
            publicUrls.push(publicUrl)

            blobStream.on("error", (err) => {
              publicUrls.pop(publicUrl) //If any error with the image, link is removed from array
              return err.message
            });

        
            blobStream.on("finish", async (data) => {

              try {
                // Make the file public
                await bucket.file(`${path}/${formatURL(file.originalname)}`).makePublic();
                
          
              } catch {
                return res.status(500).send({
                  message:
                    `Uploaded the file successfully: ${formatURL(file.originalname)}, but public access is denied!`,
                  url: publicUrl,
                });
              }
        
            });
        
            blobStream.end(file.buffer);
          })

          return publicUrls

        } catch (err) {
          if (err.code == "LIMIT_FILE_SIZE") {
             return "Files size cannot be larger than 2MB!"
            }
            return `Could not upload the file. ${err}`
        }
}


const deleteImage= async(path)=>{
  return new Promise(async(resolve, reject)=>{
    await bucket.file(path).delete().then(()=> resolve()).catch(()=> reject('Error deleting photo.'));
  })
}


const formatURL = (text) =>{
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç", 
      to   = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
      mapping = {};
 
  for(var i = 0, j = from.length; i < j; i++ )
      mapping[ from.charAt( i ) ] = to.charAt( i );
 
  var ret = [];
  for( var i = 0, j = text.length; i < j; i++ ) {
      var c = text.charAt( i );
      if( mapping.hasOwnProperty( text.charAt( i ) ) )
          ret.push( mapping[ c ] );
      else
          ret.push( c );
  }      
  return ret.join( '' ).replace( /[^-A-Za-z0-9.]+/g, '_' ).toLowerCase();
}



module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
};