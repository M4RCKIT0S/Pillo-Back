const processFile = require("../Middlewares/multer");
const { format } = require("util");
const { Storage } = require("@google-cloud/storage");
// Instantiate a storage client with credentials
const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("pillo_app");

const uploadPhoto = async(req, res,folder)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            await processFile(req, res);
            if (!req.file) {
              reject('Please upload a file.');
            }
        
            // Create a new blob in the bucket and upload the file data.
            const blob = bucket.file(req.file.originalname);
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
                await bucket.file(req.file.originalname).makePublic();
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

module.exports = uploadPhoto;