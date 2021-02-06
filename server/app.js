const fs = require('fs')
var express = require('express')
const compression = require('compression')

var app = express()
app.use(compression()) //gzip压缩
app.use(express.static('../dist'))

app.listen(8000,()=>{
    console.log('server running at http://127.0.0.1');
})