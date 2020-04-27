var router = require('express').Router()
const autoAnalyze = require('../middlewere/auto-analyze/index')
const upload = require('../middlewere/file-upgrade')

router.post('/', upload('server/files/').any(), (req, res, next)=>{
  let {txtfilename, filterWin, filterType, peakIdentWin, peakIdentType}= req.body
  console.log({txtfilename, filterWin, filterType, peakIdentWin, peakIdentType})
  autoAnalyze(
    txtfilename,
    parseInt(filterWin),
    filterType,
    parseInt(peakIdentWin),
    peakIdentType,
    function(peaks, rawData, filteredYarr){
      res.json({code:0, data:{
        peaks, rawData, filteredYarr
      }})
    })
})

module.exports = router