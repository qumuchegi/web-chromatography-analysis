const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
 
// 跨域
app.use(cors())

app.use('/txtfile',require('./routes/txtfile'))
app.use('/mannul-analyze',require('./routes/mannul-analyze'))
app.use('/auto-analyze', require('./routes/auto-analyze'))

const server = http.createServer(app)
server.listen(3001,()=> console.log('服务启动...'))