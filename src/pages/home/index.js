import React from 'react'
import SiderPannel from '../../components/sider-pannel/index'
import PeakChart from '../../components/peak-chart/index'
import ResultTable from '../../components/result-table/index'

import './style.css'

export default function(){

  return(
    <div id='home-page'>
      <div id='sider-container'>
        <SiderPannel/>
      </div>
      <div id='main-container'>
        <PeakChart/>
        <ResultTable/>
      </div>
    </div>
  )
}