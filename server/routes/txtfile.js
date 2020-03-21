var router = require('express').Router()
const upload = require('../middlewere/file-upgrade')
const txt2json = require('../middlewere/txt2json')
const makeXlsx = require('../middlewere/makexlsx')
const rmfile = require('../middlewere/rmfiles')

router.post('/upload-txt',upload('server/files/').any(),(req,res,next)=>{
  const {txtfilename}= req.body
  txt2json( txtfilename, 'server/files', ( times, values )=>{
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
router.delete('/removefiles',(req,res,next)=>{
  let {filename} = req.body
  console.log('filename', filename)
  rmfile(filename.replace('.txt',''),()=>{
    res.json({data:{code:0,msg:'成功删除临时文件'}})
  })
})
module.exports = router
