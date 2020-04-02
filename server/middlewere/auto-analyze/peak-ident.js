const fs=require('fs')
process.stdout.pipe(fs.createWriteStream('server/log.txt'))

const peakIdent = module.exports = {
  一阶导数法: peak_ident1
}
module.exports = peakIdent


let featurePoints = [] // 线程要返回的峰的列表

class FeaturePointOfPeak{ // 一个峰的特征点
  constructor(...paras){
    this.state = {
      startPoint_time, startPoint_voltage, // 起点时间和电压
      retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
      valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
      //baselinePoint_voltage, //基线电压
      leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
      rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
      endPoint_time, endPoint_voltage, // 右拐点时间和电压
      areaPeak // 面积
    } = paras[0]
  }
  
  getAllFeature(){
    return [
      //[this.state.startPoint_time, this.state.startPoint_voltage], // 起点时间和电压
      [this.state.retention_time, this.state.heighestPoint_voltage], // 保留时间和顶点电压,
      //[this.state.valleyPoint_time, this.state.valleyPoint_voltage], // 古点时间和电压
      //baselinePoint_voltage, //基线电压
      //[this.state.leftInflection_time, this.state.leftInflection_voltage], // 左拐点时间和电压
      //[this.state.rightInflection_time, this.state.rightInflection_voltage], // 左拐点时间和电压
      //[this.state.endPoint_time, this.state.endPoint_voltage] // 右拐点时间和电压
      [this.state.areaPeak]
    ]
  }
}

let startPoint_time = 0, startPoint_voltage = 0 // 起点时间和电压
let retention_time = 0, heighestPoint_voltage = 0 // 保留时间和顶点电压
let valleyPoint_time = 0, valleyPoint_voltage = 0 // 古点时间和电压
let baselinePoint_voltage = 0 //基线电压
let leftInflection_time = 0, leftInflection_voltage = 0 // 左拐点时间和电压
let rightInflection_time = 0, rightInflection_voltage = 0 // 左拐点时间和电压
let endPoint_time = 0, endPoint_voltage = 0 // 右拐点时间和电压
let areaPeak = 0 // 面积

let areaTotal = 0

/**
 * 
 * @param {横坐标，时间} xArr 
 * @param {纵坐标，电压值} yArr 
 * @param {峰识别窗口大小} win_peakIdent 
 * return 识别到的峰数组
 */
function peak_ident1(xArr, yArr,  win_peakIdent,isAuto=false,not_complete_peakPoints={}){
  // isAuto 为 true，那么需要保留当一个峰没有识别完时的起点、顶点、拐点，因为在峰识别中只有识别到终点才会保存峰
  // 如果 isAuto = true，即采用自动方法的流式处理方式，把原始谱图分成多个部分来识别峰，就需要为每一部分没有识别完的峰暂存特殊点
  // 为下一次识别保留这些特殊点
  // 清空之前文件分析得到的结果
  featurePoints=[]
  //console.log({xArr, yArr, win_peakIdent})
  let n =  win_peakIdent||100//100 //窗口大小, 对于变压油宜设置20~50
  let i = 0, {length: total_l} = yArr

  let win_d = [] // 窗口内一阶导, 这里放在全局变量，可以复用中间的导数
  let flag_peak = 0
  /**
   * 在 auto 流模式下，需要在没有识别完的峰的基础上，继续使用识别到的终点之前的特殊点，在最后一个特殊点之后寻找下一个特殊点
   * 具体方式是根据最后一个特殊点来赋值 flag_peak，用于定位特殊点识别起点
   */
  if(isAuto){
    let {
      startPoint_time,
      startPoint_voltage,
      leftInflection_time,
      leftInflection_voltage,
      retention_time,
      heighestPoint_voltage,
      rightInflection_time,
      rightInflection_voltage,
      endPoint_time,
      endPoint_voltage
    } = not_complete_peakPoints
    if(startPoint_time===0){
      flag_peak=0
    }else if(leftInflection_time===0){
      flag_peak=1
    }else if(retention_time===0){
      flag_peak=2
    }else if(rightInflection_time===0){
      flag_peak=3
    }else if(endPoint_time===0){
      flag_peak=4
    }
  }

  while(i<total_l-n){
    let win_y = yArr.slice(i,i+n).map(y => Number(y))
    let win_x = xArr.slice(i,i+n).map(x => Number(x))
    
    let {length: l} = win_y

    // 窗口内各点的一阶导(这里是已经优化的地方，
    // 就是移动窗口时窗口中间一阶导不用重复计算，只需计算窗口末尾点的一阶导)
    if(win_d.length === 0){
      for(let idx_y = 0; idx_y < l; idx_y++){
        if (idx_y < l-1){
          win_d.push(
            Number(( win_y[idx_y+1] - win_y[idx_y] ) / ( win_x[idx_y+1] - win_x[idx_y] )).toPrecision(12)
          )
        } else {
          win_d.push(
            Number(( yArr[i+n] - yArr[i+n-1] ) / ( xArr[i+n] - xArr[i+n-1] )).toPrecision(12)
          )
        }
      }
    }else{
      win_d = win_d.slice(1)
      if(yArr[i+n]){
        win_d.push(
          Number(( yArr[i+n] - yArr[i+n-1] ) / ( xArr[i+n] - xArr[i+n-1] )).toPrecision(12)
        )
      }
    }
    // 求导逻辑经过测试无误

    /**
     * 各个特征点识别条件
     */
    let isY_up = false
    let isY_down = false
    let isD_up = false
    let isD_down = false

    // 2. 使用宽松条件
    let pk_up = 0
    let pk_down = 0
    let y_max = win_y[0]
    let y_min = win_y[0]
    let b_y_up = 0  // 上升累计变量
    let b_y_down = 0
    let PT = win_peakIdent ? (win_peakIdent+1)*win_peakIdent/2*.6 : 4000//2000// 对于变压油宜设置150~1000

    let pk_dDown=0
    let pk_dUp=0
    let d_min=win_d[0]
    let d_max=win_d[0]
    let b_d_down=0 // 斜率下降累计变量
    let b_d_up=0
    let dPT= PT//对于变压油宜设置150~1000
    let n_dPT=.5// 

    for(let y of win_y.slice(1)){
      if(y>y_max) {
        y_max=y
        b_y_up++
        pk_up+=b_y_up
      }
      else if(y<y_max){
        b_y_up=0
      }

      if(y<y_min){// 这里不能用 else if
        y_min=y
        b_y_down++
        pk_down=pk_down-b_y_down
      }
      else if(y>y_min){
        b_y_down=0
      }
    }

    for(let d of win_d.slice(1)){
      if(Number(d) < Number(d_min)){
        d_min=d
        b_d_down++
        pk_dDown=pk_dDown-b_d_down
      }
      else if(Number(d) > Number(d_min)){
        b_d_down=0
      }

      if(Number(d) > Number(d_max)){// 这里不能用 else if
        d_max=d
        b_d_up++
        pk_dUp+=b_d_up
      }
      else if(Number(d) < Number(d_max)){
        b_d_up=0
      }
    }

    if(pk_up>=PT){
      isY_up=true
    }

    if(pk_down<=-PT){
      isY_down=true
    }

    if(pk_dUp>=dPT){
      isD_up=true
    }

    if(pk_dDown<=-dPT){
      isD_down=true
    }

    // 为判断起点设置的额外条件
    let extrat_Start_condition = (!win_d[parseInt(n/2-1)]<n_dPT || !win_d[parseInt(n/2)]<n_dPT)  

    // flag_peak===4 代表刚刚识别完右拐点
    if(flag_peak===4){
      areaTotal+=win_y[0]*0.000833
      // 窗口不满足 h_0>h_1....>h_n-1
      if( !isY_down ){
        // 终点，不满足d_0<d_1<....<d_n-1
        if(!isD_up){
          endPoint_time=win_x[0]
          endPoint_voltage=win_y[0]
          // 计算峰面积
          // 峰里的梯形面积
                  // 峰里的梯形面积,经过修改改为矩形，取起点和终点中最小的为矩形的高，矩形宽为起点和终点时间差
          let areaPeakLadder = Math.min(endPoint_voltage, startPoint_voltage)*(endPoint_time-startPoint_time)
          console.log('计算峰面积：',{areaTotal, areaPeakLadder})
          areaPeak = (areaTotal - areaPeakLadder).toFixed(3)
          featurePoints.push(
            new FeaturePointOfPeak({
              startPoint_time, startPoint_voltage, // 起点时间和电压
              retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
              valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
              //baselinePoint_voltage, //基线电压
              leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
              rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
              endPoint_time, endPoint_voltage, // 右拐点时间和电压
              areaPeak // 面积
            })
          )
          // 重置所有变量，为识别下一个峰做准备
          startPoint_time=0
          startPoint_voltage=0 // 起点时间和电压
          retention_time=0
          heighestPoint_voltage=0 // 保留时间和顶点电压,
          valleyPoint_time=0
          valleyPoint_voltage=0// 古点时间和电压
          baselinePoint_voltage=0//基线电压
          leftInflection_time=0
          leftInflection_voltage=0 // 左拐点时间和电压
          rightInflection_time=0 
          rightInflection_voltage=0 // 左拐点时间和电压
          endPoint_time=0
          endPoint_voltage=0 // 右拐点时间和电压
          areaPeak=0 // 面积
          flag_peak=0
          areaTotal=0
        }
         // 谷点，d_0<d_1<....<d_n-1
         // s\上面这个条件也太不符合了吧
        /*else if(isD_up){
          valleyPoint_time=win_x[0]
          valleyPoint_voltage=win_y[0]
          flag_peak=1
        }
        */
      }
      // h_0>h_1....>h_n-1
      else if( isY_down ){
        // 后肩峰，d_0>d_1>....>d_n-1
        if( isD_down ){
          flag_peak=4
        }
      }
      i++
      continue
    }
    // flag_peak===3 代表刚刚识别完顶点
    if(flag_peak===3){
      areaTotal+=win_y[0]*0.000833
      // 右拐点,d_0<d_1<....<d_n-1
      if(  isD_up && isY_down  ){
        rightInflection_time=win_x[0]
        rightInflection_voltage=win_y[0]
        flag_peak=4
        
      }
      else if( isY_up || isD_up ){
        flag_peak=0
        areaTotal=0
      }
      i++
      continue
    }
    //flag_peak=2(这里论文里面是1，感觉写错了)，代表刚刚识别完左拐点
    if(flag_peak===2){
      areaTotal+=win_y[0]*0.000833
      // 峰顶点， h_0>h_1....>h_n-1
      if( isY_down ){
        retention_time=win_x[0]
        heighestPoint_voltage=win_y[0]
        flag_peak=3
      }
      else if(isY_down){
        flag_peak=0
        areaTotal=0
      }
      i++
      continue
    }
      // 刚刚识别完起点，下一个识别左拐点
    else if(flag_peak===1){
      areaTotal+=win_y[0]*0.000833
      // d_0>d_1>....>d_n-1
      if(isD_down){
        flag_peak=2
        leftInflection_time=win_x[0]
        leftInflection_voltage=win_y[0]
      }
      else if(isY_down&&!isY_up){
        flag_peak=0
        areaTotal=0
      }
      i++
      continue
    }
    // flag_peak===0 代表刚刚识别完一个峰， flag_peak 重置为0
    else if(flag_peak===0){
      // 峰起点, d_0<d_1<....<d_n-1
      // h_0<h_1....<h_n-1
      if( 
        isY_up 
        && extrat_Start_condition 
        //&& isD_up
      ){
        flag_peak=1
        startPoint_time=win_x[0]
        startPoint_voltage=win_y[0]
        areaTotal+=win_y[0]*0.000833
      }
      i++
      continue
    }
  }
  return {
    peaks: featurePoints,
    notComplete_peakPoints:{
      startPoint_time,
      startPoint_voltage,
      leftInflection_time,
      leftInflection_voltage,
      retention_time,
      heighestPoint_voltage,
      rightInflection_time,
      rightInflection_voltage,
      endPoint_time,
      endPoint_voltage
    }
  }
}  
