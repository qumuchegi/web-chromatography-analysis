import React from 'react'
import SiderPannel from '../../components/sider-pannel/index'
import PeakChart from '../../components/peak-chart/index'
import ResultTable from '../../components/result-table/index'

import avatarSrc from '../../assets/imgs/avatar.jpeg'
import codeIcon from '../../assets/imgs/code.png'
import renferIcon from '../../assets/imgs/cankao.png'
import keyTechIcon from '../../assets/imgs/keyTech.png'
import githubIcon from '../../assets/imgs/github.png'

import './style.css'

export default function(){

  return(
    <div>
      <div id='prj-description'>
        <div id='github-link'>
          <div>曲木车格</div>
          <a href='https://github.com/qumuchegi' target='_blank' rel="noopener noreferrer">
            <img src={githubIcon} alt='' style={{width: '40px'}}/>
          </a>
        </div>
        <div>
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
      <div id='home-page'>
        <div id='sider-container'>
          <SiderPannel/>
        </div>
        <div id='main-container'>
          <PeakChart/>
          <ResultTable/>
        </div>
      </div>
    </div>
  )
}