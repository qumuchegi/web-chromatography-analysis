var router = require('express').Router()
const upload = require('../middlewere/file-upgrade')
const txt2json = require('../middlewere/txt2json')
const makeXlsx = require('../middlewere/makexlsx')

router.post('/upload-txt',upload('files/').any(),(req,res,next)=>{
  const {txtfilename}= req.body
  txt2json( txtfilename, './files', ( times, values )=>{
    res.json({
      code:0, 
      data:{prjTitle: txtfilename, times, values}
    })
  })
})

router.post('/download-xlsx',(req, res, next)=>{
  let {rows} = req.body
  console.log(rows)
  let kvMap = {
    retention_time: '保留时间 (min)',
    startPoint_time: '起点 (min)',
    endPoint_time: '终点 (min)',
    heighestPoint_voltage: '峰高 (min)',
    areaPeak: '面积 (min*mv)',
    ratio: '含量 (%)'
  }
  rows = rows.map(row=>{
    let newRow = {}
    newRow[kvMap.retention_time] = row.retention_time
    newRow[kvMap.startPoint_time] = row.startPoint_time
    newRow[kvMap.endPoint_time] = row.endPoint_time
    newRow[kvMap.heighestPoint_voltage] = row.heighestPoint_voltage
    newRow[kvMap.areaPeak] = row.areaPeak
    newRow[kvMap.ratio] = row.ratio
    return newRow
  })
  makeXlsx(rows, (xlsxfile)=>{
    res.end(xlsxfile)
  })
})

module.exports = router
