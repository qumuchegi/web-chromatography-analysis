import React,{useState} from 'react'
import api from '../../api'

import './style.css'

export default function PCUpload(){
  const [filename, setFilename] = useState(null)
  const [formData, setFormData] = useState(null)

  function changeFile(e){
    let file = e.target.files[0]
    setFilename(file.name)
    let formData = new FormData()
    formData.append('fileBlob', file)
    formData.append('filename', file.name)
    setFormData(formData)
  }
  async function upload(){
    let res = await api.post('/pc-upload', formData)
    if(res.code === 0){
      alert('成功上传文件，请到移动端下载文件用于色谱分析')
    }
  }
  function cancel(){
    setFilename(null)
    setFormData(null)
  }
  return (
    <div id="upload-body">
      <h1 id='page-header'>上传原始色谱文件<span style={{color:'rgb(97, 209, 212)'}}>(移动端上传入口)</span></h1>
      <input type='file' onChange={changeFile} id='input-file' />
      {
        filename ?
        <div id='success-read-file'>
          <div>
            文件<span>{filename}</span>
          </div>
          <div id='buttons'>
            <div onClick={upload} id="upload-button">开始上传</div>
            <div onClick={cancel} id="cancel-button">取消</div>
          </div>
        </div>
        :
        <label for='input-file' id='label'>
          <div>点击上传文件</div>
      </label>
      }
    </div>
  )
}