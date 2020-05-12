const http = require('http')
const https = require('https')
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
app.use(express.static('server/dist/build'))
 
// 跨域
app.use(cors())
// 提供web版首页
app.use('/txtfile',require('./routes/txtfile'))
app.use('/mannul-analyze',require('./routes/mannul-analyze'))
app.use('/auto-analyze', require('./routes/auto-analyze'))
app.get('/prj-intro-dir', (req, res)=>{
  let arr=[]
  let dirs = fs.readdirSync('server/project-intro')
  dirs.forEach(dir=>{
    arr.push({[dir]: fs.readdirSync('server/project-intro/'+dir)})
  })
  res.json({
    code:0,
    data: {
      introDir: arr
    }
  })
})
app.get('/prj-intro-file', (req, res, next)=>{
  let {introDir, introJsonFileName} = req.query
  res.json({
    code: 0,
    data: {
      jsonFileContent: fs.readFileSync('server/project-intro/'+introDir+'/'+introJsonFileName,'utf-8')
    }
  })
})

/**
 * 以下API专门针对移动端
 */
app.post('/pc-upload',upload('server/assets/').any(),(req,res,next)=>{
  res.json({
    data:{code:0}
  })
})

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

const server_https = https.createServer({
  key: fs.readFileSync('server/config/privatekey.pem'),
  cert: fs.readFileSync('server/config/certificate.pem')
})

const host='0.0.0.0'
server_https.listen(443, host, ()=> console.log('https 服务启动'))
module.exports = server.listen(80,host, ()=> console.log('服务启动...'))
