var multer  = require('multer')

var storage = (destination)=> multer.diskStorage({
    destination,
    filename: function(req, file, callback) {
      callback(null, file.originalname);
    }
  });
  var txtFilter = function (req, file, cb) {
      if (!file.originalname.match(/\.(txt)$/i)) {
        return cb(new Error('Only txt files are allowed!'), false);
      }
      cb(null, true);
  };
  var upload = destination => multer({ storage: storage(destination), fileFilter: txtFilter})

  module.exports = upload