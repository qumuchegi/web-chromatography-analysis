/**
 * 使用 node.js 流，用户在上传数据文件的同时预先设置好滤波和峰识别的窗口大小，
 * 然后服务端接收文件和窗口大小参数，就可以流式读取文件里的数据
 * 同时调用滤波和峰识别的处理函数
 * 这个过程中，有可能滤波和峰识别的窗口大小不同，
 * 由于是先经过滤波，然后再将滤波结果用来峰识别
 * 所以如果滤波窗口设置得比峰识别窗口小，
 * 那么峰识别需要等待前面的滤波结果数据达到峰识别窗口容纳的数据量，才能执行峰识别
 */
const fs = require('fs')
const stream = require('stream')
const Transform = stream.Transform
const filter = require('./filter')
const peakIdent = require('./peak-ident')

let total_rawData={
  xArr:[], yArr:[]
}
let total_filterData={
  xArr:[],
  yArr:[]
}
let rawData={
  xArr:[], yArr:[]
}
let filterData={
  xArr: [], yArr:[]
}

let peaks = [] // 全局变量，存储识别到的峰，返回给前端

const autoAnalyze = (txtfilename, filterWin, filterType, peakIdentWin, peakIdentType, resCb) => {
  let dirname = 'server/files'
  let readStream = fs.createReadStream(`${dirname}/${txtfilename}`)
  
  let filterFun = filter[filterType]
  let peakIdentFun = peakIdent[peakIdentType]

  let peakIdentMiddleWere = peakIdent_middlewere(peakIdentFun, peakIdentWin)
  
  readStream
  .pipe( filter_middlwere(filterFun, filterWin) )
  .pipe( peakIdentMiddleWere )

  readStream.on('data',(chunk)=>{})
  readStream.on('end',()=>{
    //console.log({peaks, total_rawData})
    resCb(peaks, total_rawData, total_filterData.yArr)
    peaks=[]
    total_rawData.xArr = []
    total_rawData.yArr = []
    total_filterData.yArr = []
    total_filterData.xArr = []
    rawData.xArr = []
    rawData.yArr = []
    filterData.xArr = []
    filterData.yArr = []
    testLength=0
    not_complete_peaks_points={}
  })
}

const filter_middlwere = (filterFun, win) => new Transform({
  transform(chunk, encoding,cb){
    let matchLine = /\d*\.\d{6}[\t\s]+\d*\.\d{3}/g
    let lines = chunk.toString().match(matchLine)
    let xArr=[], yArr=[]
    lines && lines.forEach(
      line=>{
        let [x,y] = line.split(/[\t\s]+/)
        xArr.push(x)
        yArr.push(y)
      }
    )
    rawData.xArr.push( ...xArr )
    rawData.yArr.push( ...yArr )
    
    // rawData.yArr.length > win*10
    filterData.xArr.push( ...rawData.xArr )
    /**
     * 滤波会出现断层,所以最后会出现识别到的峰数量减少的情况
     * 所以需要结合之前的原始数据来滤波
     */
    if(total_rawData.yArr.length > win){
      let tmp_rawData_yArr = total_rawData.yArr.slice(-win).concat(rawData.yArr)
      let filtered = filterFun(tmp_rawData_yArr, win)
      filterData.yArr.push(  ...filtered.slice(win) )
    }else{
      let filtered = filterFun(rawData.yArr, win)
      filterData.yArr.push(  ...filtered)
    }
    total_rawData.xArr.push( ...rawData.xArr )
    total_rawData.yArr.push( ...rawData.yArr )
    this.push( JSON.stringify(filterData) )
    rawData.xArr = []
    rawData.yArr = []
    filterData.xArr = []
    filterData.yArr = []
    cb()
  }
})

var _xArr=[],_yArr=[],testLength = 0
const isAuto=true
var not_complete_peaks_points={
  startPoint_time:0,
  startPoint_voltage:0,
  leftInflection_time:0,
  leftInflection_voltage:0,
  retention_time:0,
  heighestPoint_voltage:0,
  rightInflection_time:0,
  rightInflection_voltage:0,
  endPoint_time:0,
  endPoint_voltage:0
}
function peakIdent_middlewere(peakIdentFun, peakIdentWin){
  let transform =  new Transform({
    transform(chunk, encoding,cb){
      let {xArr, yArr} = JSON.parse( chunk.toString() )
      _xArr.push(...xArr)
      _yArr.push(...yArr)
      /*console.log(
        '峰识别：',
        {
        _yArrLength: _yArr.length,
        yArrLength: yArr.length
        })
      */
      testLength+=yArr.length

      if(_yArr.length > peakIdentWin){
        let peakIdentRes = peakIdentFun(_xArr, _yArr,  peakIdentWin,isAuto,not_complete_peaks_points)
        let peaks_win = peakIdentRes.peaks
        not_complete_peaks_points= peakIdentRes.notComplete_peakPoints
        //console.log({not_complete_peaks_points})
        peaks.push( ...peaks_win )
        _xArr=[]
        _yArr=[]
      }
      total_filterData.yArr.push( ...yArr)
      total_filterData.xArr.push( ...xArr)
      //console.log(testLength, total_filterData.yArr.length,total_rawData.yArr.length)
      cb()
    }
  })
  return transform
} 

module.exports = autoAnalyze
