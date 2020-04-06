import React from 'react'
import { Provider } from 'react-redux'
import { matchRoutes, renderRoutes } from "react-router-config"
import {BrowserRouter, Switch} from 'react-router-dom'
import Home from '../pages/home/index'
import PCUpload from '../pages/pc-upload/index'

import {store} from '../redux/store'

const routes = [
  {
    path: '/',
    component: Home,
    exact: true
  },{
    path: '/pc-upload-file',
    component: PCUpload
  }
]

export default function Root() {
  return(
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          {renderRoutes(routes)}
        </Switch>
      </BrowserRouter>
    </Provider>
  )
}
