
const filter = {
  平均滤波: average_filter,
  中值滤波: mid_filter,
  多项式滤波: multi_filter
}

module.exports = filter

// 移动平均滤波
function average_filter(yArr, win_filter){
  //console.log((win_filter-1)/2)
  let m=parseInt( (win_filter-1)/2 )//200 // 窗口大小为 2m+1, 如果窗口大小为20 那么 m=10,
  let i=0
  let {length} = yArr
  let new_y = []
  let y
  
  while(i<length){
    let start,end
    start = (i-m)>0?(i-m):0
    end = i+m
    let win_y = yArr.slice(start,end+1)
    .map(d=>Number(d))

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

// 中值滤波
function mid_filter(yArr, win_filter){
  /*
  console.log({
    yArr, win_filter
  })
  */
  let new_y = []
  let {length} = yArr
  let i = 0

  while(i<length){
    let win_y = yArr.slice(i,i+Number(win_filter))
    .map(d=>Number(d))
    .sort((a,b)=>a-b)
    //console.log(win_y)
    let mid = win_y[parseInt(win_y.length/2)]
    new_y.push(mid)
    i++
  }
  return new_y
}

// 多项式拟合滤波
function multi_filter(yArr, m){
  //let m=2//parseInt( (win_filter-1)/2 )//200 // 窗口大小为 2m+1, 如果窗口大小为20 那么 m=10,
  m = Number(m)
  let i=m
  let {length} = yArr
  let new_y = yArr.slice(0,m)
  
  while(i<length-m){
    let y_item = 0
    let start,end
    start = i-m
    end = i+m
    console.log({start,end})
    let win_y = yArr.slice(start,end+1)
    .map(d=>Number(d))

    console.log(win_y,i)
    y_item = computeY_item(win_y,m)
    console.log(y_item)

    new_y.push(y_item)
    i++
  }
  new_y = new_y.concat(yArr.slice(i))
  console.log('多项式滤波：',new_y)
  return new_y

  function computeY_item(win_y,m){
    switch(m){
      case 2:
        return (-3*win_y[0]+12*win_y[1]+17*win_y[2]+12*win_y[3]-3*win_y[4])/35;
      case 3:
        return (-4*win_y[0]+6*win_y[1]+12*win_y[2]+14*win_y[3]+12*win_y[4]+6*win_y[5]-4*win_y[6])/42;
      default:
        return 0
    }
  }
}