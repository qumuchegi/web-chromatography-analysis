/**
 * 峰识别
 */
//import {pureReverse, pureSort} from '../utils/index'

// 子线程
onmessage=function(e){
  let [xArr, yArr] = e.data
  postMessage(peak_ident(xArr,yArr))
}
  
function pureReverse(arr){
  let Arr =[...arr]
  return Arr.reverse()
}

function pureSort(arr){
  let Arr = [...arr]
  return Arr.sort((a,b)=>a>b?1:(a===b)?0:-1)
}

let featurePoints = [] // 线程要返回的峰的列表

class FeaturePointOfPeak{ // 一个峰的特征点
  constructor(...paras){
    this.state={
      startPoint_time, startPoint_voltage, // 起点时间和电压
      retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
      valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
      //baselinePoint_voltage, //基线电压
      leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
      rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
      endPoint_time, endPoint_voltage, // 右拐点时间和电压
      //aeraPeak // 面积
    }=paras[0]
  }
  getStart(){
    let {startPoint_time:t, startPoint_voltage:v} = this.state
    return {t, v}
  }
  getHeighest(){
    let {retention_time:t, heighestPoint_voltage:v} = this.state
    return {t, v}
  }
  getValley(){
    let {valleyPoint_time:t, valleyPoint_voltage:v} = this.state
    return {t, v}
  }
  getLeftInflection(){
    let {leftInflection_time:t, leftInflection_voltage:v} = this.state
    return {t, v}
  }
  getRightInflection(){
    let {rightInflection_time:t, rightInflection_voltage:v} = this.state
    return {t, v}
  }
  getEnd(){
    let {endPoint_time:t, endPoint_voltage:v} = this.state
    return {t, v}
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
    ]
  }
}

let startPoint_time=0, startPoint_voltage=0 // 起点时间和电压
let retention_time=0, heighestPoint_voltage=0 // 保留时间和顶点电压
let valleyPoint_time=0, valleyPoint_voltage=0 // 古点时间和电压
let baselinePoint_voltage=0 //基线电压
let leftInflection_time=0, leftInflection_voltage=0 // 左拐点时间和电压
let rightInflection_time=0, rightInflection_voltage=0 // 左拐点时间和电压
let endPoint_time=0, endPoint_voltage=0 // 右拐点时间和电压
let aeraPeak=0 // 面积

function peak_ident(xArr, yArr){
  let n=10 //窗口大小, 对于变压油宜设置20~50
  let i=0,{length:total_l}=yArr

  let win_d=[] // 窗口内一阶导, 这里放在全局变量，可以复用中间的导数
  let flag_peak=0

  while(i<total_l-1){
    let win_y = yArr.slice(i,i+n).map(y=>Number(y))
    let win_x = xArr.slice(i,i+n).map(x=>Number(x))
    
    let {length:l}=win_y

    // 窗口内各点的一阶导(这里是已经优化的地方，
    // 就是移动窗口时窗口中间一阶导不用重复计算，只需计算窗口末尾点的一阶导)

    if(win_d.length===0){
      for(let idx_y=0; idx_y<l; idx_y++){
        if(idx_y<l-1){
          win_d.push(
            (win_y[idx_y+1]-win_y[idx_y])/(win_x[idx_y+1]-win_x[idx_y])
          )
        }else{
          win_d.push(
            (yArr[i+n]-yArr[i+n-1])/(xArr[i+n]-xArr[i+n-1])
          )
        }
      }
    }else{
      win_d=win_d.slice(1)
      if(yArr[i+n]){
        win_d.push(
          (yArr[i+n]-yArr[i+n-1])/(xArr[i+n]-xArr[i+n-1])
        )
      }
    }

    /**
     * 各个特征点识别条件
     */
    let isY_up
    let isY_down
    let isD_up
    let isD_down

    /*
    // 1. 不使用宽松条件

    // 开始特征点识别
    let win_y_sorted = pureSort( win_y )// 窗口内纵坐标从小到大排列
    let win_d_sorted = pureSort( win_d )// 窗口内一阶导从小到大排列
    // 条件1, 窗口内 h_0<h_1<....<h_n-1
    isY_up = JSON.stringify(win_y)===JSON.stringify(win_y_sorted)
    // 条件2，h_0>h_1>....>h_n-1
    isY_down = JSON.stringify(win_y)===JSON.stringify(pureReverse(win_y_sorted))
    // 条件3，一阶导 d_0<d_1<....<d_n-1
    isD_up = JSON.stringify(win_d)===JSON.stringify(win_d_sorted)
    // 条件4，一阶导 d_0>d_1>....>d_n-1
    isD_down = JSON.stringify(win_d)===JSON.stringify(pureReverse(win_d_sorted))
   
    */

    
    // 2. 使用宽松条件
    let pk_up=0
    let pk_down=0
    let y_max=win_y[0]
    let y_min=win_y[0]
    let b_y_up=0  // 上升累计变量
    let b_y_down=0
    let PT= 40// 对于变压油宜设置150~1000

    let pk_dDown=0
    let pk_dUp=0
    let d_min=win_d[0]
    let d_max=win_d[0]
    let b_d_down=0 // 斜率下降累计变量
    let b_d_up=0
    let dPT= 40//对于变压油宜设置150~1000
    let n_dPT=.5 // 
    
    for(let y of win_y.slice(1)){
      if(y>y_max) {
        y_max=y
        b_y_up++
        pk_up+=b_y_up
      }
      else if(y<=y_max){
        b_y_up=0
      }

      if(y<y_min){// 这里不能用 else if
        y_min=y
        b_y_down++
        pk_down=pk_down-b_y_down
      }
      else if(y>=y_min){
        b_y_down=0
      }
    }

    for(let d of win_d.slice(1)){
      if(d<d_min){
        d_min=d
        b_d_down++
        pk_dDown=pk_dDown-b_d_down
      }
      else if(d>=d_min){
        b_d_down=0
      }

      if(d>d_max){// 这里不能用 else if
        d_max=d
        b_d_up++
        pk_dUp+=b_d_up
      }
      else if(d<=d_max){
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

    let extrat_Start_condition = (!win_d[parseInt(n/2-1)]<n_dPT || !win_d[parseInt(n/2)]<n_dPT)  // 为判断起点设置的额外条件

    console.log({
      pk_up,
      pk_dUp,
      pk_down,
      pk_dDown,
      isY_up,
      isY_down,
      isD_up,
      isD_down,
      //win_x,
      //win_y,
      //win_d,
      flag_peak
    })

    // flag_peak===4 代表刚刚识别万顶点
    if(flag_peak===4){
      // 窗口不满足 h_0>h_1....>h_n-1
      if( !isY_down ){
        // 谷点，d_0<d_1<....<d_n-1
        if( isD_up ){
          valleyPoint_time=win_x[0]
          valleyPoint_voltage=win_y[0]
          flag_peak=1
          i++
          console.log('谷点', 
            {
              startPoint_time, startPoint_voltage, // 起点时间和电压
              retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
              valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
              //baselinePoint_voltage, //基线电压
              leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
              rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
              endPoint_time, endPoint_voltage, // 右拐点时间和电压
              //aeraPeak // 面积
            }
          )
          continue
        }
        // 终点，不满足d_0<d_1<....<d_n-1
        else {
          endPoint_time=win_x[0]
          endPoint_voltage=win_y[0]
          // 计算峰面积
          // aeraPeak=
        
          console.log('终点',
            {
              startPoint_time, startPoint_voltage, // 起点时间和电压
              retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
              valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
              //baselinePoint_voltage, //基线电压
              leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
              rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
              endPoint_time, endPoint_voltage, // 右拐点时间和电压
              //aeraPeak // 面积
            }
          )

          featurePoints.push(
            new FeaturePointOfPeak({
              startPoint_time, startPoint_voltage, // 起点时间和电压
              retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
              valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
              //baselinePoint_voltage, //基线电压
              leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
              rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
              endPoint_time, endPoint_voltage, // 右拐点时间和电压
              //aeraPeak // 面积
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
          aeraPeak=0 // 面积

          flag_peak=0

          i++
          continue
        }
      }
      // h_0>h_1....>h_n-1
      else if( isY_down ){
        // 后肩峰，d_0>d_1>....>d_n-1
        if( isD_down ){
          flag_peak=4
          i++
          /*
          console.log(
            '后肩峰:', 
            {
              startPoint_time, startPoint_voltage, // 起点时间和电压
              retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
              valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
              //baselinePoint_voltage, //基线电压
              leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
              rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
              endPoint_time, endPoint_voltage, // 右拐点时间和电压
              //aeraPeak // 面积
            }
          )
          */
          continue
        }
        else{
          i++
          continue
        }
      }
    }
    // flag_peak===3 代表刚刚识别完顶点
    if(flag_peak===3){
      // 右拐点,d_0<d_1<....<d_n-1
      if( isD_up ){
        rightInflection_time=win_x[0]
        rightInflection_voltage=win_y[0]
        flag_peak=4
        i++
        console.log('右拐点',
          {
            startPoint_time, startPoint_voltage, // 起点时间和电压
            retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
            valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
            //baselinePoint_voltage, //基线电压
            leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
            rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
            endPoint_time, endPoint_voltage, // 右拐点时间和电压
            //aeraPeak // 面积
          }
        )
        continue
      }else{
        i++
        continue
      }
    }
    //flag_peak=2(这里论文里面是1，感觉写错了)，代表刚刚识别完左拐点
    if(flag_peak===2){
      // 峰顶点， h_0>h_1....>h_n-1
      if( isY_down ){
        retention_time=win_x[0]
        heighestPoint_voltage=win_y[0]
        flag_peak=3
        i++
        console.log('顶点',
          {
            startPoint_time, startPoint_voltage, // 起点时间和电压
            retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
            valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
            //baselinePoint_voltage, //基线电压
            leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
            rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
            endPoint_time, endPoint_voltage, // 右拐点时间和电压
            //aeraPeak // 面积
          }
        )
        continue
      }
      // 前肩峰,则另 flag_peak=2,继续寻找下一个顶点
      //d_0<d_1<....<d_n-1
      else if( isD_up ){
        flag_peak=2
        i++
        /*
        console.log('前肩峰',
          {
            startPoint_time, startPoint_voltage, // 起点时间和电压
            retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
            valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
            //baselinePoint_voltage, //基线电压
            leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
            rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
            endPoint_time, endPoint_voltage, // 右拐点时间和电压
            //aeraPeak // 面积
          }
        )
        */
        continue
      }else{
        i++
        continue
      }
    }
      // 刚刚识别完起点，下一个识别左拐点
    else if(flag_peak===1){
        // d_0>d_1>....>d_n-1
      if( isY_up && isD_down ){
        flag_peak=2
        leftInflection_time=win_x[0]
        leftInflection_voltage=win_y[0]
        i++
        console.log('左拐点', 
          {
            startPoint_time, startPoint_voltage, // 起点时间和电压
            retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
            valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
            //baselinePoint_voltage, //基线电压
            leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
            rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
            endPoint_time, endPoint_voltage, // 右拐点时间和电压
            //aeraPeak // 面积
          }
        )
        continue
      }
      else{
        //flag_peak=0
        i++
        continue
      }
    }
    // flag_peak===0 代表刚刚识别完一个峰， flag_peak 重置为0
    else if(flag_peak===0){
      // 峰起点, d_0<d_1<....<d_n-1
      // h_0<h_1....<h_n-1
      if( 
        isY_up 
        && extrat_Start_condition 
        && isD_up
      ){
        flag_peak=1
        //if(startPoint_time===0||startPoint_voltage===0){
        startPoint_time=win_x[0]
        startPoint_voltage=win_y[0]
        //}
        i++
        console.log('起点',
          {
            startPoint_time, startPoint_voltage, // 起点时间和电压
            retention_time, heighestPoint_voltage, // 保留时间和顶点电压,
            valleyPoint_time, valleyPoint_voltage, // 古点时间和电压
            //baselinePoint_voltage, //基线电压
            leftInflection_time, leftInflection_voltage, // 左拐点时间和电压
            rightInflection_time, rightInflection_voltage, // 左拐点时间和电压
            endPoint_time, endPoint_voltage, // 右拐点时间和电压
            //aeraPeak // 面积
          }
        )
        continue
      }
      else{
        i++
        continue
      }
    }
  }
  return featurePoints
}  


