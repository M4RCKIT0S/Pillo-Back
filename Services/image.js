const processFile = require("../Middlewares/multer");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
const { resolve } = require("path");
// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("pillo_app");

const uploadSingleImage = async(req, res, path)=>{
    console.log(req)
    return new Promise(async(resolve, reject)=>{
        try {

            if (!req.file) {
              reject('Please upload a file.');
            }
            
            // Create a new blob in the bucket and upload the file data.
            const blob = bucket.file(`${path}/${req.file.originalname}`);
            const blobStream = blob.createWriteStream({
              resumable: false,
            });
        
            blobStream.on("error", (err) => {
              reject(err.message);
            });
        
            blobStream.on("finish", async (data) => {
              // Create URL for directly file access via HTTP.
              const publicUrl = format(
                `https://storage.googleapis.com/${bucket.name}/${blob.name}`
              );
        
              try {
                // Make the file public
                await bucket.file(`${path}/${req.file.originalname}`).makePublic();
              } catch {
                return res.status(500).send({
                  message:
                    `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
                  url: publicUrl,
                });
              }
        
              resolve(publicUrl);
            });
        
            blobStream.end(req.file.buffer);
          } catch (err) {
            if (err.code == "LIMIT_FILE_SIZE") {
               reject("File size cannot be larger than 2MB!")
              }
              reject(`Could not upload the file. ${err}`);
          }
    })
}

const uploadMultipleImages = async(req, res, path)=>{
  return new Promise(async(resolve, reject)=>{
      try {

          if (!req.files) {
            reject('Please upload a file.');
          }
          
          let publicUrls = []

          req.files.forEach(file =>{
            // Create a new blob in the bucket and upload the file data.
            const blob = bucket.file(`${path}/${file.originalname}`);
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
              reject(err.message);
            });

        
            blobStream.on("finish", async (data) => {

              try {
                // Make the file public
                await bucket.file(`${path}/${file.originalname}`).makePublic();
                
          
              } catch {
                return res.status(500).send({
                  message:
                    `Uploaded the file successfully: ${file.originalname}, but public access is denied!`,
                  url: publicUrl,
                });
              }
        
            });
        
            blobStream.end(file.buffer);
          })

          resolve(publicUrls)

        } catch (err) {
          if (err.code == "LIMIT_FILE_SIZE") {
             reject("Files size cannot be larger than 2MB!")
            }
            reject(`Could not upload the file. ${err}`);
        }
  })
}
const deleteImage= async(path)=>{
  return newPromise(async(resolve, reject)=>{
    await bucket.file(path).delete().then(()=> resolve()).catch(()=> reject('Error deleting photo.'));
  })
}
module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage
};