var router = require('express').Router()
var echarts = require('node-echarts-canvas');

router.post('/',(req,res,next)=>{
  let { option } = req.body
  var config = {
    width: 400, // Image width, type is number.
    height: 500, // Image height, type is number.
    option, // Echarts configuration, type is Object.
    //If the path  is not set, return the Buffer of image.
    path:  'server/files/chart.png', // Path is filepath of the image which will be created.
    enableAutoDispose: true  //Enable auto-dispose echarts after the image is created.
  }
  
  echarts(config)
  
  res.json({code:0,data:{url: '/chart.png'}})
})
module.exports = router