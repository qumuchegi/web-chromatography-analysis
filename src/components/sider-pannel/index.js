import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Avatar from '@material-ui/core/Avatar';
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

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

function getSteps() {
  return ['导入色谱数据', '滤波', '峰识别','定性定量计算'];
}

function getStepContent(stepIndex,{onFileChange, filter, peakIdent, compute, buttonHadClicked}) {
  switch (stepIndex) {
    case 0:
      return <div>
        <label htmlFor='file' id="file-input-button">
          <img src={jsonFile} alt='上传' style={{width: '20px', display:'block'}}></img>
          导入数据
        </label>
        <input type='file' id='file' style={{display:'none'}} onChange={onFileChange}/>
      </div>
      ;
    case 1:
      return <Button onClick={filter} color="secondary" variant="outlined" disabled={buttonHadClicked}>
        滤波
      </Button>;
    case 2:
      return <Button onClick={peakIdent} color="primary" variant="outlined" disabled={buttonHadClicked}>
        峰检测
      </Button>;
    case 3:
      return <Button onClick={compute} color="secondary" variant="outlined" disabled={buttonHadClicked}>
        定性定量计算
      </Button>;
    default:
      return '完成';
  }
}

export default function(){
  const classes = useStyles()
  const [activeStep, setActiveStep] = React.useState(0)
  const [buttonHadClicked, setButtonHadClicked] = React.useState(false)

  const steps = getSteps()

  const next = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1)
  }

  const back = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1)
  }

  const handleReset = () => {
    dispatch( clearStore )
    setActiveStep(0)
  }

  const onFileChange = (e) => {
    e.persist()
    let file = e.target.files[0]
    if(!file) return
    let fileReader = new FileReader()
    let prjTitle = file.name
    console.log('file', file)
    fileReader.readAsText(file)
    fileReader.onload = function(){
      let JSONData = JSON.parse( this.result) 
      let { times,values } = JSONData
      //console.log(times, values)
      dispatch( upgradeOriginData(prjTitle, times, values) )
      times=null
      values=null
      next()
    }
  }

  const filter = (filterType) => {
    setButtonHadClicked(true)
    let yData = getState().dataReducer.data_origin.values
    //average_filter(yData)
    let filter_worker = new Worker(average_filter_worker_url)
    console.log('滤波前原始数据：', yData)
    filter_worker.postMessage(yData)
    filter_worker.onmessage=data=>{
      console.log('滤波线程返回：', data.data)
      dispatch( savefilteredData(data.data) )
      yData=null
      setButtonHadClicked(false)
      next()
    }
  }

  const peakIdent = () => {
    setButtonHadClicked(true)
    let peak_worker = new Worker(peak_ident_worker_url)
    let times = getState().dataReducer.data_origin.times
    let values_filtered = getState().dataReducer.data_filtered
    peak_worker.postMessage([times, values_filtered])
    //console.log('peak_worker:',peak_worker)
    peak_worker.onmessage=(data)=>{
      console.log('子线程返回检测到的峰:',data.data)
      dispatch( savePeakIdentData(data.data) )
      times=null
      values_filtered=null
      setButtonHadClicked(false)
      next()
    }
  }

  const compute = () => {
    next()
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
              {buttonHadClicked?<img src={loadingIcon} alt='' id="loading-icon"/>:null}
              {getStepContent(activeStep,{onFileChange, filter, peakIdent, compute, buttonHadClicked})}
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
            <div style={{fontSize:'.9rem'}}>项目开源</div>
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