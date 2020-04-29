var router = require('express').Router()
var echarts = require('node-echarts-canvas');

router.post('/',(req,res,next)=>{
  let { option } = req.body
  var config = {
    width: 1000, 
    height: 700,
    option,
    path:  'server/files/chart.png',
    enableAutoDispose: true 
  }
  
  echarts(config)
  
  res.json({code:0,data:{url: '/chart.png'}})
})
module.exports = router