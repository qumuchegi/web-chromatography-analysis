import React from 'react'
import api from '../../api'
import { makeStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import jsonFile from '../../assets/imgs/json.png'
import loadingIcon from '../../assets/imgs/loading.png'

import './style.css'

import {
  upgradeOriginData, 
  savefilteredData, 
  savePeakIdentData, 
  saveComputedData,
  clearStore
} from '../../redux/actions'
import {store} from '../../redux/store'
const {dispatch, getState} = store

const average_filter_worker_url =  './data-process/filter.js'
const peak_ident_worker_url =  './data-process/peak-identify.js' // 使用 worker 的方式调用峰识别函数

const filter_type = {
  average: '平均滤波',
  mid: '中值滤波',
  multi: '多项式滤波',
}
const peakIdent_type = {
  first: '一阶导数法'
}

const useStyles = makeStyles(theme => ({
  avatar: {
    display: 'flex',
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}))

function getSteps(win_filter, win_peakIdent, filterType,m,peakIdentType) {
  return [
    <div>
      <h4>导入色谱数据</h4><span className='strong-span'>txt 文件格式</span></div>, 
    <div>
      <h4>滤波</h4> 
      <div className='strong-div'>
        <div>{filterType}</div>
        <div>
          {
          filterType===filter_type.multi ? 
          <strong className='strong-span'>多项式拟合次数 {m}</strong>
          :<strong className='strong-span'>滤波窗口大小 {win_filter} </strong>
        }
        </div>
      </div>
    </div>, 
    <div>
      <h4>峰识别和定性定量计算</h4>
      <div className='strong-div'>
        <div>{peakIdentType}</div>
        <div>峰检测窗口大小 <span className='strong-span'>{win_peakIdent}</span></div>
      </div>
    </div>
  ]
}

function getStepContent(stepIndex,{
  onFileChange, 
  filterType,
  peakIdentType,
  m,
  onSelectFilterType,
  onSelectPeakIdentType,
  filter, 
  peakIdent, 
  onWinFilterChange, 
  onWinPeakIdentChange
}) {
  switch (stepIndex) {
    case 0:
      return <div>
        <label htmlFor='file-2' id="file-input-button-2">
          <img src={jsonFile} alt='上传' style={{width: '20px', display:'block'}}></img>
          导入数据（txt）
        </label>
        <input type='file' id='file-2' style={{display:'none'}} onChange={onFileChange}/>
      </div>
      ;
    case 1:
      return <>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={filterType}
          onChange={onSelectFilterType}
        >
          <MenuItem value={filter_type.average}>移动平均滤波</MenuItem>
          <MenuItem value={filter_type.mid}>中值滤波</MenuItem>
          <MenuItem value={filter_type.multi}>多项式拟合滤波</MenuItem>
        </Select>
        {
          filterType===filter_type.multi ?
          <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={m}
          onChange={onWinFilterChange}
          >
            <MenuItem value={2}>拟合次数 2</MenuItem>
            <MenuItem value={3}>拟合次数 3</MenuItem>
          </Select>
          :
          <TextField onChange={onWinFilterChange} size='small' id="outlined-basic"  variant="outlined" label="设置滤波窗口大小" />
        }
       
        <Button onClick={filter} color="secondary" variant="outlined">
          滤波
        </Button>
      </>;
    case 2:
      return <>
        <TextField onChange={onWinPeakIdentChange} size='small' variant="outlined"   label="设置检峰窗口大小"/>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={peakIdentType}
          onChange={onSelectPeakIdentType}
        >
          <MenuItem value={peakIdent_type.first}>{peakIdent_type.first}</MenuItem>
        </Select>
        <Button onClick={peakIdent} color="primary" variant="outlined">
          峰检测和定性定量计算
        </Button>
      </>;
    default:
      return '完成';
  }
}

export default function(){
  const classes = useStyles()
  const [filename, setFilename] = React.useState(null)
  const [activeStep, setActiveStep] = React.useState(0)
  const [win_filter, setWin_filter] = React.useState(0)
  const [win_peakIdent, setWin_peakIdent] = React.useState(0)
  const [m, setM] = React.useState(2)
  const [filterType, setFilterType] = React.useState(filter_type.average)
  const [peakIdentType, setPeakIdentType] = React.useState(peakIdent_type.first)
  const [showLoading, setShowLoading] = React.useState(false)

  React.useEffect(() => {
    const mode={
      mannul:'auto',
      auto:'mannul'
   }
    function onClickSVG(){
      dispatch( clearStore )

      let bg = document.getElementById('switch-background')
      let handle = document.getElementById('mode-handle')
      let mannulPannel = document.getElementsByClassName('mannul-pannel')[0]
      let autoPannel = document.getElementsByClassName('auto-pannel')[0]

      bg.setAttribute('class', mode[bg.className.baseVal])
      handle.setAttribute('class', mode[handle.className.baseVal])

      if(mannulPannel.classList.contains('show-pannel')){
        mannulPannel.classList.remove(`show-pannel`)
        mannulPannel.classList.add(`hide-pannel`)
      }else{
        mannulPannel.classList.remove(`hide-pannel`)
        mannulPannel.classList.add(`show-pannel`)
      }
 
      if(autoPannel.classList.contains('show-pannel')){
        autoPannel.classList.remove(`show-pannel`)
        autoPannel.classList.add(`hide-pannel`)
      }else{
        autoPannel.classList.remove(`hide-pannel`)
        autoPannel.classList.add(`show-pannel`)
      }
    }
    document.getElementById('switch').addEventListener('click', onClickSVG,false)
    
    return () => {
      document.getElementById('switch').removeEventListener('click', onClickSVG)
    }
  }, [])

  const steps = getSteps(win_filter, win_peakIdent,filterType,m,peakIdentType)

  const next = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const back = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = async() => {
    dispatch( clearStore )
    let res = await api.delete('/txtfile/removefiles',{filename})
    if(res.code===0){
      console.log(res.msg)
      setActiveStep(0)
    }
  }

  const autoAnalyze = async(e) => {
    if(!win_filter||!win_peakIdent) return alert('请输入滤波和峰识别窗口大小')
    e.persist()
    let file = e.target.files[0]
    if(!file) return
    setFilename(file.name)
    setShowLoading(true)
    let formData = new FormData()
    formData.append('txtfilename', file.name)
    formData.append('txtfile', file)
    //  filterWin, filterType, peakIdentWin, peakIdentType
    formData.append('filterWin', win_filter)
    formData.append('peakIdentWin', win_peakIdent)
    formData.append('filterType', filterType)
    formData.append('peakIdentType', peakIdentType)

    let res = await api.post('/auto-analyze', formData)
    let {peaks, rawData, filteredYarr} = res

    let {xArr:times, yArr:values} = rawData
    setShowLoading(false)
    dispatch( upgradeOriginData(file.name, times, values) )
    dispatch( savefilteredData(filteredYarr) )
    dispatch( savePeakIdentData(peaks) )
  }

  const onFileChange = async(e) => {
    e.persist()
    let file = e.target.files[0]
    if(!file) return
    setFilename(file.name)
    // 改为将 txt 原文件上传至服务器，由服务器来序列化和分析数据，同时提供下载 xlsx 分析结果文件功能
    let formData = new FormData()
    formData.append('txtfilename', file.name)
    formData.append('txtfile', file)
    let res = await api.post('/txtfile/upload-txt', formData)
    let {prjTitle, times, values} = res
    dispatch( upgradeOriginData(prjTitle, times, values) )
    next()
  }

  const onSelectFilterType = (e) => {
    setFilterType(e.target.value)
  }

  const onSelectPeakIdentType = (e) => {
    setPeakIdentType(e.target.value)
  }

  const filter = () => {
    if(
      !win_filter && filterType!==filter_type.multi
    ) return alert('请输入滤波窗口大小')
    setShowLoading(true)
    let yArr = getState().dataReducer.data_origin.values
    //average_filter(yData)
    let filter_worker = new Worker(average_filter_worker_url)
    // 调起woker线程，向其传入色谱数据和滤波的类型和窗口大小
    filter_worker.postMessage([yArr, filterType===filter_type.multi ? m:win_filter, filterType])
    // worker线程返回滤波结果
    filter_worker.onmessage=data=>{
      console.log('滤波线程返回：', data.data)
      dispatch( savefilteredData(data.data) )
      yArr=null
      setShowLoading(false)
      next()
    }
  }

  const peakIdent = () => {
    if(!win_peakIdent && filterType!==filter_type.multi) return alert('请输入峰检测窗口大小')
    setShowLoading(true)
    let peak_worker = new Worker(peak_ident_worker_url)
    let times = getState().dataReducer.data_origin.times
    let values_filtered = getState().dataReducer.data_filtered
    peak_worker.postMessage([times, values_filtered, win_peakIdent,peakIdentType])
    peak_worker.onmessage=(data)=>{
      console.log('子线程返回检测到的峰:',data.data)
      dispatch( savePeakIdentData(data.data) )
      times=null
      values_filtered=null
      setShowLoading(false)
      next()
    }
  }

  const onWinFilterChange = (e) => {
    filterType===filter_type.multi ?
    setM(e.target.value)
    :
    setWin_filter(e.target.value)
  }
  const onWinPeakIdentChange = (e) => {
    setWin_peakIdent(e.target.value)
  }

  return(
    <div id='sider'>
      <div id='loading' className={showLoading?'show-loading':'hide-loading'}>
        <div>
          <svg width="260" height="240">
            <circle  stroke-width='4' cx='40' cy='70' id='out-1'/>
            <circle   stroke-width='4' cx='220' cy='70' id='out-3'/>
          </svg>
          <h2 style={{textAlign:'center',color:'#868'}}>正在计算中...</h2>
        </div>
      </div>
      <div id='operation-mode-pannel'>
        <h4>是否自动分析</h4>
        <svg width="60" height="40" id='switch'>
          <rect x="10" y="10" width="44" height="22"  stroke-width='3' rx='11' ry='11' id='switch-background' className='mannul'/>
          <circle r='10' fill='white' stroke-width='4' id='mode-handle' className='mannul'/>
        </svg>
      </div>
      <div className='auto-pannel hide-pannel'>
        <h3 style={{padding:'0px 10px',color:'#666'}}>自动模式</h3>
        <div>
          <div id='auto-pannel-set-form'>
            <FormControl component="fieldset">
              <FormLabel component="legend">选择滤波方法</FormLabel>
              <RadioGroup aria-label="gender" name="gender1" value={filterType} onChange={onSelectFilterType}>
                <FormControlLabel value={filter_type.average} control={<Radio />} label={filter_type.average} />
                <FormControlLabel value={filter_type.mid} control={<Radio />} label={filter_type.mid} />
                <FormControlLabel value={filter_type.multi} control={<Radio />} label={filter_type.multi} />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset">
              <TextField label={`${filterType} 滤波窗口`} variant="outlined" onChange={onWinFilterChange} size='small'/>
            </FormControl>
            <FormControl component="fieldset">
              <FormLabel component="legend">选择峰识别方法</FormLabel>
              <RadioGroup aria-label="gender" name="gender1" value={peakIdentType} onChange={onSelectPeakIdentType}>
                <FormControlLabel value={peakIdent_type.first} control={<Radio />} label={peakIdent_type.first} />
              </RadioGroup>
            </FormControl>
            <FormControl component="fieldset">
              <TextField label={`${peakIdentType} 滤波窗口`} variant="outlined" onChange={onWinPeakIdentChange} size='small'/>
            </FormControl>
          </div>
          
          <label htmlFor='file-1' id="file-input-button-1">
            <img src={jsonFile} alt='上传' style={{width: '20px', display:'block'}}></img>
            导入数据（txt）即可开始分析
          </label>
          <input type='file' id='file-1' style={{display:'none'}} onInput={autoAnalyze}/>
        </div>
      </div>
      <div className='mannul-pannel show-pannel'>
        <h3 style={{padding:'0px 10px',color:'#616'}}>手动模式</h3>
        <Stepper activeStep={activeStep}  orientation="vertical" style={{backgroundColor:'#eee'}}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>
          {activeStep === steps.length ? (
            <div className="mannul-step-button">
              <Typography className={classes.instructions}>色谱分析完成</Typography>
              <Button onClick={handleReset}>重置</Button>
            </div>
          ) : (
            <div className="mannul-step-button">
               {getStepContent(activeStep,
                {
                  onFileChange, 
                  filterType,
                  peakIdentType,
                  m,
                  onSelectFilterType,
                  onSelectPeakIdentType,
                  filter, 
                  peakIdent, 
                  onWinFilterChange, 
                  onWinPeakIdentChange
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}