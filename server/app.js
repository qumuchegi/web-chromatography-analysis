const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const fs = require('fs')
const bodyParser = require('body-parser')

const upload = require('./middlewere/file-upgrade')

app.use(bodyParser.json({limit : '2100000kb'})); // 请求体大小限制 2 M
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('server/asstes'))
app.use(express.static('server/files'))
 
// 跨域
app.use(cors())

app.use('/txtfile',require('./routes/txtfile'))
app.use('/mannul-analyze',require('./routes/mannul-analyze'))
app.use('/auto-analyze', require('./routes/auto-analyze'))

/**
 * 以下API专门针对移动端
 */
app.post('/pc-upload',upload('server/assets/').any(),(req,res,next)=>{
  res.json({
    data:{code:0}
  })
})
app.use('/server-render-chart', require('./routes/server-render-chart'))

app.get('/read-assets-dir',(req,res,next)=>{
  res.json({code:0,data:{
    dir: fs.readdirSync('server/assets')
  }})
})
app.get('/read-assets-file',(req,res,next)=>{
  let {filename} = req.query
  res.json({code:0,data:{
    fileBlob: fs.readFileSync('server/assets/'+filename)
  }})
})

const server = http.createServer(app)
server.listen(3001,()=> console.log('服务启动...'))