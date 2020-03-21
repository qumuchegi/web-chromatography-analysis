const fs = require('fs')

const rmfile = module.exports = function(filename,cb){
  fs.unlinkSync(`server/files/${filename}.txt`)
  fs.unlinkSync(`server/files/${filename}.json`)
  cb()
}