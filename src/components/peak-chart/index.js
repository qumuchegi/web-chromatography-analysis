import React,{useState,useEffect} from 'react'
import {withRouter}  from 'react-router-dom'
import {connect} from  'react-redux'
import * as echarts from 'echarts'
import Checkbox from '@material-ui/core/Checkbox'
import {store} from '../../redux/store'
import './style.css'

const {dispatch, getState, subscribe} = store

export default withRouter( connect()(Chart) )

function Chart(props){
  const [prjTitle, setPrjTitle] = useState('')
  const [chartGroup, setChartGroup] = useState(['origin','filter','peak'])

  useEffect(() => {
    console.log('chart props:', props)
    //getDataForChart()
    let unSub = subscribe(()=>{
      getDataForChart()
    })

    return ()=>{
      unSub()
    }
  }, [])

  useEffect(() => {
    getDataForChart()
  }, [chartGroup.length])

  const getDataForChart = () => {
    console.log('新的 chartGroup:', chartGroup)
    let state = getState().dataReducer
    let {data_origin, data_filtered, data_peakIdent} = state
    setPrjTitle(data_origin.prjTitle)
    let times = data_origin.times || []
    let o_values = data_origin.values || []
    let f_values = data_filtered || []
    let peaks = data_peakIdent || []
    let markPoints=getMarkPoints_peak(peaks)

    let chartContainer = echarts.init(document.getElementById('mix-chart'))

    let yArr_stack=[
      {name:'原始谱图', value: o_values},
      {name:'滤波谱图', value: f_values,markPoints}
    ]
    if(chartGroup.indexOf('origin')===-1){
      yArr_stack=yArr_stack.filter(item=>item.name!=='原始谱图')
      //yArr_stack.push({name:'原始谱图', value: o_values})
    }
    if(chartGroup.indexOf('filter')===-1){
      yArr_stack=yArr_stack.filter(item=>item.name!=='滤波谱图')
      //yArr_stack.push({name:'滤波谱图', value: f_values,markPoints})
    }
    if(chartGroup.indexOf('peak')===-1){
      if(yArr_stack.some(item=>item.name==='滤波谱图')){
        yArr_stack=yArr_stack.filter(item=>item.name!=='滤波谱图')
        yArr_stack.push({name:'滤波谱图', value: f_values})
      }
    }
    printChart(
      times, 
      yArr_stack, 
      chartContainer
    )
    times=null
    yArr_stack=null
  }

  const printChart = (xArr, yArr_stack, chartContainer) => {
    var option = {
      toolbox:{
        feature:{
          saveAsImage:{

          }
        }
      },
      legend: {
        data: yArr_stack.map(yArr=>yArr.name)
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
          type: 'category',
          data: xArr,
          name: '时间 / min'
      },
      yAxis: {
          type: 'value',
          name: '电压 / mv'
      },
      dataZoom: [
        {
            show: true,
            realtime: true,
            start: 0,
            end: 100,
        },
        {
          show: true,
          start: 0,
          end: 100,
      }
     ],
      series: yArr_stack.map(yArr=>
          ({
            name: yArr.name,
            data: yArr.value,
            type: 'line',
            smooth: true,
            markPoint:{
              symbol:'triangle',
              symbolKeepAspect: false,
              symbolSize: 10,
              //symbolOffset:[0,0],
              data: yArr.markPoints
            },
          })
        )
        
    
    }
    chartContainer.setOption(option,{notMerge: true}) // 取消与之前的合并
  }

  const getMarkPoints_peak = (peaks) => {
    console.log('peaks:', peaks)
    let markPoints = []
      
    peaks.forEach((peak,i)=>{
      //通过线程交换的对象被省略了方法，只有属性，所以不能调用方法
      //console.log(peak.getAllFeature())
      
      markPoints.push(
        {
          value:i+1+'峰起点',
          coord:[`${Number(peak.state.startPoint_time).toFixed(6)}`, peak.state.startPoint_voltage]
        },
        /*{
          value:i+1+'左拐点',
          coord:[`${Number(peak.state.leftInflection_time).toFixed(6)}`, peak.state.leftInflection_voltage]
        },*/
        {
          value:i+1+'顶点',
          coord:[`${Number(peak.state.retention_time).toFixed(6)}`, peak.state.heighestPoint_voltage]
        },
        /*{
          value:i+1+'右拐点',
          coord:[`${Number(peak.state.rightInflection_time).toFixed(6)}`, peak.state.rightInflection_voltage]
        },*/
        {
          value:i+1+'终点',
          coord:[`${Number(peak.state.endPoint_time).toFixed(6)}`, peak.state.endPoint_voltage]
        },
      )
    } )

    return markPoints
  }

  const onCheckboxChange = (e) => {
    console.log(e.target.value)
    setChartGroup(chartGroup=>{
      let new_chartGroup = []
      if(chartGroup.indexOf(e.target.value)===-1){
        new_chartGroup =  [...new Set([e.target.value,...chartGroup])]
      }else{
        new_chartGroup = chartGroup.filter(item=>item!==e.target.value)
      }
   
      return new_chartGroup
    })
  }

  return(
    <div id='chart-container'>
      <h4 style={{textAlign:'center'}}>{prjTitle}</h4>
      <div style={{display:'flex', justifyContent:'space-around'}}>
        <div id="mix-chart" style={{width: '800px',height:'400px'}}></div>
        <div>
          <div>
            <Checkbox
              checked={chartGroup.indexOf('origin')!==-1}
              onChange={onCheckboxChange}
              value="origin"
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
            <span>原始谱图</span>
          </div>
          <div>
            <Checkbox
              checked={chartGroup.indexOf('filter')!==-1}
              onChange={onCheckboxChange}
              value="filter"
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
            <span>滤波后谱图</span>
          </div>
          <div>
            <Checkbox
              checked={chartGroup.indexOf('peak')!==-1}
              onChange={onCheckboxChange}
              value="peak"
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
            <span>峰标注</span>
          </div>
        </div>
      </div>
    </div>
  )
}