const XLSX = require('js-xlsx')
const fs = require('fs')

module.exports = makeXlsx

function makeXlsx(_data,resCb){
  let _headers=[
    '保留时间 (min)',
    '起点 (min)',
    '终点 (min)',
    '峰高 (min)',
    '面积 (min*mv)',
    '含量 (%)'
  ]
  let headers = _headers
  .map((v, i) => Object.assign({}, {v: v, position: String.fromCharCode(65+i) + 1 }))
  .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})

  let data = _data
  .map((v, i) => _headers.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65+j) + (i+2) })))
  .reduce((prev, next) => prev.concat(next))
  .reduce((prev, next) => Object.assign({}, prev, {[next.position]: {v: next.v}}), {})

  // 合并 headers 和 data
  var output = Object.assign({}, headers, data)
  // 获取所有单元格的位置
  var outputPos = Object.keys(output)
  // 计算出范围
  var ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];
  // 构建 workbook 对象
  var wb = {
      SheetNames: ['mySheet'],
      Sheets: {
          'mySheet': Object.assign({}, output, { '!ref': ref })
      }
  };
  // 导出 Excel
  XLSX.writeFile(wb, './files/result.xlsx')
  resCb(fs.readFileSync('./files/result.xlsx'))
}