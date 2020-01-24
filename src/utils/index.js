export function pureReverse(arr){
  let Arr =[...arr]
  return Arr.reverse()
}

export function pureSort(arr){
  let Arr = [...arr]
  return Arr.sort((a,b)=>a>b?1:(a===b)?0:-1)
}