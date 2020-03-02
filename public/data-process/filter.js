/**
 * 滤波
 */

 // 子线程
onmessage=function(e){
  console.log(e)
 let [yArr, win_filter] = e.data
 console.log(yArr, win_filter)
 postMessage(average_filter(yArr, win_filter))
}
// 移动平均滤波

function average_filter(yArr, win_filter){
  console.log((win_filter-1)/2)
  let m=parseInt( (win_filter-1)/2 )//200 // 窗口大小为 2m+1, 如果窗口大小为20 那么 m=10,
  let i=0
  let {length} = yArr
  let new_y = []
  let y
  
  while(i<length){
    let start,end
    start = (i-m)>0?(i-m):0
    end = i+m
    let win_y = yArr.slice(start,end+1).map(d=>Number(d))
    if(new_y.length < 2*m+1){
      // 下面 end-start 不能写成 2*m，因为数据起点开始的时候窗口内数据个数并不是 2*m+1
      y = ((win_y.reduce((a,b)=>a+b))/(end-start+1)).toFixed(12)
    }
    else{
      let yi_= new_y.slice(-1)[0]
      let xim =  Number(win_y.slice(-1)[0])
      let xim_1 =  Number(yArr[start-1>=0?start-1:0])
      y = Number( Number(yi_) + (xim-xim_1)/(2*m+1) ).toFixed(12)
    }
    //console.log(y)
    new_y.push(y)
    i++
  }
  return new_y
}