var router = require('express').Router()
const filter = require('../middlewere/auto-analyze/filter')
const peakIdet = require('../middlewere/auto-analyze/peak-ident')

router.post('/filter',(req,res,next)=>{
  let {filterWin, filterType,yArr}= req.body
  res.json({
    code:0,
    data:{
      filtered_yArr: filter[filterType](yArr, filterWin)
    }
  })
})
router.post('/peak-ident',(req,res,next)=>{
  let {peakIdentWin, peakIdentType,xArr,yArr}= req.body
  res.json({
    code:0,
    data:{
      filtered_yArr: peakIdet[peakIdentType](xArr, yArr,  peakIdentWin)
    }
  })
})

module.exports = router