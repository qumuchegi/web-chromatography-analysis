import React,{useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button'
import saveIcon from '../../assets/imgs/Save.png'
import './style.css'

import {store} from '../../redux/store'
const {dispatch, getState, subscribe} = store



const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableContainer:{
    maxHeight: 300
  }
})

export default function(){
  const classes = useStyles()
  const [rows, setRows] = useState([])
  
  useEffect(() => {
    let unSub=subscribe(()=>{
      if(Object.keys(getState().dataReducer).indexOf('data_peakIdent')===-1) return
      let peaks = getState().dataReducer.data_peakIdent||[]
      console.log('表格：', peaks)
      let rows=[]
      peaks.forEach((peak,i)=>{
        rows.push({
          name:i+1,
          retention_time: Number(peak.state.retention_time).toFixed(6),
          startPoint_time: Number(peak.state.startPoint_time).toFixed(6),
          endPoint_time: Number(peak.state.endPoint_time).toFixed(6),
          heighestPoint_voltage: peak.state.heighestPoint_voltage.toFixed(3),
          areaPeak: peak.state.areaPeak
        })
      } )
      setRows(rows)
    })
    return ()=>{
      unSub()
    }
  }, [])

  if(rows.length>0)
  return(
    <div id='result-body'>
      <TableContainer className={classes.tableContainer}>
      <Table className={classes.table} aria-label="sticky table" stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>组分</TableCell>
            <TableCell align="right">保留时间&nbsp;(min)</TableCell>
            <TableCell align="right">起点&nbsp;(min)</TableCell>
            <TableCell align="right">终点&nbsp;(min)</TableCell>
            <TableCell align="right">峰高&nbsp;(min)</TableCell>
            <TableCell align="right">面积&nbsp;(min)</TableCell>
            <TableCell align="right">含量&nbsp;(%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="center">{row.retention_time}</TableCell>
              <TableCell align="center">{row.startPoint_time}</TableCell>
              <TableCell align="center">{row.endPoint_time}</TableCell>
              <TableCell align="center">{row.heighestPoint_voltage}</TableCell>
              <TableCell align="center">{row.areaPeak}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <div id='result-output'>
      <Button
            color="primary"
            size="small"
            className={classes.button}
            startIcon={<img src={saveIcon} style={{width:"13px"}} alt=''/>}
          >
            保存分析结果
      </Button>
    </div>
  </div>
  )
  else return null
}