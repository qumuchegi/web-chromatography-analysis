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

import jsonFile from '../../assets/imgs/json.png'
import avatarSrc from '../../assets/imgs/avatar.jpeg'
import codeIcon from '../../assets/imgs/code.png'
import renferIcon from '../../assets/imgs/cankao.png'
import keyTechIcon from '../../assets/imgs/keyTech.png'
import loadingIcon from '../../assets/imgs/loading.png'
import githubIcon from '../../assets/imgs/github.png'

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

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
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

function getSteps(win_filter, win_peakIdent, filterType,m) {
  return ['导入色谱数据 ( txt 文件格式 )', `滤波 ( ${filterType} , ${filterType===filter_type.multi? '多项式拟合次数'+m:'滤波窗口大小'+win_filter } )`, `峰识别和定性定量计算 ( 一阶导峰检测窗口大小 ${win_peakIdent} )`];
}

function getStepContent(stepIndex,{
  onFileChange, 
  filterType,
  m,
  onSelectFilterType,
  filter, 
  peakIdent, 
  buttonHadClicked, 
  onWinFilterChange, 
  onWinPeakIdentChange
}) {
  switch (stepIndex) {
    case 0:
      return <div>
        <label htmlFor='file' id="file-input-button">
          <img src={jsonFile} alt='上传' style={{width: '20px', display:'block'}}></img>
          导入数据（txt）
        </label>
        <input type='file' id='file' style={{display:'none'}} onChange={onFileChange}/>
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
       
        <Button onClick={filter} color="secondary" variant="outlined" disabled={buttonHadClicked}>
          滤波
        </Button>
      </>;
    case 2:
      return <>
        <TextField onChange={onWinPeakIdentChange} size='small' variant="outlined"   label="设置检峰窗口大小"/>
        <Button onClick={peakIdent} color="primary" variant="outlined" disabled={buttonHadClicked}>
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
  const [buttonHadClicked, setButtonHadClicked] = React.useState(false)
  const [filterType, setFilterType] = React.useState(filter_type.average)

  const steps = getSteps(win_filter, win_peakIdent,filterType,m)

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

  const filter = () => {
    if(
      !win_filter && filterType!==filter_type.multi
    ) return alert('请输入滤波窗口大小')
    setButtonHadClicked(true)
    let yArr = getState().dataReducer.data_origin.values
    //average_filter(yData)
    let filter_worker = new Worker(average_filter_worker_url)
    console.log('滤波前原始数据：', yArr)
    
    filter_worker.postMessage([yArr, filterType===filter_type.multi ? m:win_filter, filterType])
    filter_worker.onmessage=data=>{
      console.log('滤波线程返回：', data.data)
      dispatch( savefilteredData(data.data) )
      yArr=null
      setButtonHadClicked(false)
      next()
    }
  }

  const peakIdent = () => {
    if(!win_peakIdent && filterType!==filter_type.multi) return alert('请输入峰检测窗口大小')
    setButtonHadClicked(true)
    let peak_worker = new Worker(peak_ident_worker_url)
    let times = getState().dataReducer.data_origin.times
    let values_filtered = getState().dataReducer.data_filtered
    peak_worker.postMessage([times, values_filtered, win_peakIdent])
    peak_worker.onmessage=(data)=>{
      console.log('子线程返回检测到的峰:',data.data)
      dispatch( savePeakIdentData(data.data) )
      times=null
      values_filtered=null
      setButtonHadClicked(false)
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
      <div className={classes.root}>
        <Stepper activeStep={activeStep}  orientation="vertical">
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
              {buttonHadClicked?<div><img src={loadingIcon} alt='' id="loading-icon"/></div>:null}
              {getStepContent(activeStep,
                {
                  onFileChange, 
                  filterType,
                  m,
                  onSelectFilterType,
                  filter, 
                  peakIdent, 
                  buttonHadClicked, 
                  onWinFilterChange, 
                  onWinPeakIdentChange
                })}
            </div>
          )}
        </div>
      </div>
      <div id='prj-description'>
        <div id='github-link'>
          <div>曲木车格</div>
          <a href='https://github.com/qumuchegi' target='_blank' rel="noopener noreferrer">
            <img src={githubIcon} alt='' style={{width: '40px'}}/>
          </a>
        </div>
        <div className={classes.root}>
          <h4>东南大学仪科学院·毕设项目</h4>
        </div>
        <div id='prj-extensions-link'>
          <div>
            <img src={codeIcon} alt='' style={{width:'20px',display:'block'}}/>
            <div style={{fontSize:'.9rem'}}>
              <a href='https://github.com/qumuchegi/web-chromatography-analysis'
                 target='_blank'
                 rel="noopener noreferrer"
              >项目开源</a>
            </div>
          </div>
          <div>
            <img src={keyTechIcon} alt='' style={{width:'20px',display:'block'}}/>
            <div style={{fontSize:'.9rem'}}>关键算法</div>
          </div>
          <div>
            <img src={renferIcon} alt='' style={{width:'20px',display:'block'}}/>
            <div style={{fontSize:'.9rem'}}>参考</div>
          </div>
        </div>
      </div>
    </div>
  )
}