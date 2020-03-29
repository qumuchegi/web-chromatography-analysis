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
let rawData={
  xArr:[], yArr:[]
}
let filterData={
  xArr: [], yArr:[]
}

let peaks = []

const autoAnalyze = (txtfilename, filterWin, filterType, peakIdentWin, peakIdentType, resCb) => {
  let dirname = 'server/files'
  let readStream = fs.createReadStream(`${dirname}/${txtfilename}`)
  
  let filterFun = filter[filterType]
  let peakIdentFun = peakIdent[peakIdentType]

  console.log('初始peaks：',peaks)

  let peakIdentMiddleWere = peakIdent_middlewere(peakIdentFun, peakIdentWin)
  readStream
  .pipe( filter_middlwere(filterFun, filterWin) )
  .pipe( peakIdentMiddleWere )
  
  peakIdentMiddleWere.on('data',(chunk)=>{})
  peakIdentMiddleWere.on('end',()=>{
    console.log({peaks, total_rawData})
    resCb(peaks, total_rawData)
    peaks=[]
    total_rawData.xArr = []
    total_rawData.yArr = []
    rawData.xArr = []
    rawData.yArr = []
    filterData.xArr = []
    filterData.yArr = []
  })
}

const filter_middlwere = (filterFun, win) => new Transform({
  transform(chunk, encoding,cb){
    let matchLine = /\d*\.\d{6}[\t\s]+\d*\.\d{3}/g
    let lines = chunk.toString().match(matchLine)
    let xArr=[], yArr=[]
    lines.forEach(
      line=>{
        let [x,y] = line.split(/[\t\s]+/)
        //console.log(t,v)
        xArr.push(x)
        yArr.push(y)
      }
    )
    rawData.xArr.push( ...xArr )
    rawData.yArr.push( ...yArr )

    total_rawData.xArr.push( ...xArr )
    total_rawData.yArr.push( ...yArr )

    if( rawData.yArr.length > win*10 ){
      //console.log('滤波:', rawData)
      filterData.xArr.push( ...rawData.xArr )
      filterData.yArr.push(  ...filterFun(rawData.yArr, win) )
      this.push( JSON.stringify(filterData) )
      rawData.xArr = []
      rawData.yArr = []
      filterData.xArr = []
      filterData.yArr = []
    }
    cb()
  }
})

function peakIdent_middlewere(peakIdentFun, peakIdentWin){
  let transform =  new Transform({
    transform(chunk, encoding,cb){
      let _xArr=[],_yArr=[]
      let {xArr, yArr} = JSON.parse( chunk.toString() )
      _xArr.push(...xArr)
      _yArr.push(...yArr)
      if(_xArr.length > peakIdentWin){
        peaks.push( ...peakIdentFun(_xArr, _yArr,  peakIdentWin) )
        //peaks=[...new Set(peaks)]
      }
      cb()
    }
  })
  return transform
} 

module.exports = autoAnalyze
