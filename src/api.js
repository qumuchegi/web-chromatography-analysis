import axios from 'axios'
const serverUrl = 'http://localhost:3001'

export default{
  get: async function(path='/', reqData={}){
    let params = []
    for(let k in reqData){
      params.push(`${k}=${reqData[k]}`)
    }
    params = '?' + params.join('&')
    return response( await axios.get(serverUrl+path+params) )
  },
  post: async function(path='/', postData={}){
    return response( await axios.post(serverUrl+path,postData) )
  },
  download_xlsx: async function(path='/', data){
    return download( await axios.post(serverUrl+path, data,{ responseType: 'blob'}) )
  }
}

function download(res){
  let {status, data: bufArr} = res
  console.log(bufArr)
  console.log(typeof bufArr)
  let fileBlob = new Blob([bufArr], {type: 'application/vnd.ms-excel'})
  return fileBlob
}

function response(res){
  let {status, data} = res
  if(status===200){
    console.log(data)
    console.log(typeof data)
    return data.data
  }
}