// 对API的单元测试，测试接口用到了 supertest.js 这个库
const request = require('supertest');
const assert = require('assert').strict;
const app = require('../server/app');

function testAutoAPI1(done, notCompleteQuery){
  request(app)
  .post('/auto-analyze')
  .send(notCompleteQuery)
  .expect('Content-Type', /json/)
  .expect(200)
  .end((err, res)=>{
    assert.equal(res.body.code, 1)
    assert.equal(res.body.data.msg, '参数不完整')
    done()
  })
}
function testAutoAPI2(done, okQuery, expectPeaksNum){
  request(app)
  .post('/auto-analyze')
  .send(okQuery)
  .expect('Content-Type', /json/)
  .expect(200)
  .end((err, res)=>{
    assert.equal(res.body.code, 0)
    assert.equal(res.body.data.peaks.length, expectPeaksNum)
    done()
  })
}

describe('POST /auto-analyze, 测试色谱算法接口，接口参数验证和峰识别的准确性', ()=>{
  const notCompleteQuery = {
    txtfilename: 'bianyayou.txt',
    filterWin: 75,
    filterType: '平均滤波',
    peakIdentWin: 50
  }
  const bianyayou = {
    txtfilename: 'bianyayou.txt',
    filterWin: 75,
    filterType: '平均滤波',
    peakIdentWin: 50,
    peakIdentType: '一阶导数法'
  }
  const anjisuan = {
    txtfilename: 'anjisuan.txt',
    filterWin: 600,
    filterType: '平均滤波',
    peakIdentWin: 90,
    peakIdentType: '一阶导数法'
  }

  it('自动分析API 应该返回参数不完整信息',(done)=>{
    testAutoAPI1(done, notCompleteQuery)
  })
  it('自动分析API 分析变压油样品识别到的的峰应该只有一个',(done)=>{
    testAutoAPI2(done, bianyayou, 1)
  })
  it('自动分析API 分析氨基酸样品识别到的的峰应该有17个',(done)=>{
    testAutoAPI2(done, anjisuan, 17)
  }).timeout(20000) // 这里 mocha 测试时间较长
})