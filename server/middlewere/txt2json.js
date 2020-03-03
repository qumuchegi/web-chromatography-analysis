const fs = require('fs')
const stream = require('stream')
const transform = stream.Transform

module.exports = txt2json

function txt2json(txtFileName, dirname, resCb){
  let matchLine = /\d*\.\d{6}[\t\s]+\d*\.\d{3}/g
  let readStream = fs.createReadStream(`${dirname}/${txtFileName}`)
  let times = [], values = []
  let transLine = new transform({
    transform(chunk,encoding,cb){
      let lines = chunk.toString().match(matchLine)
      lines.forEach(
        line=>{
          let [t,v] = line.split(/[\t\s]+/)
          //console.log(t,v)
          times.push(t)
          values.push(v)
          this.push(`${JSON.stringify({t,v})}`)
        }
      )
      cb()
    }
  })
  
  readStream
  .pipe(transLine)
  transLine.on('data',(chunk)=>{//不知道为什么，只有监听 data ，下面的 end 事件才会触发
    //console.log(chunk)
  })
  transLine.on('end',()=>{
    console.log('times',times)
    
    fs.writeFileSync(`${dirname}/${txtFileName.replace(/\.txt$/i,'')}.json`,
      JSON.stringify({
        times,values
      }),'utf-8'
    )
    resCb( times, values)
  })
  
}
