import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { MainContextProvider } from './context/main'
import {
  RouterProvider,
  createHashRouter,
} from "react-router-dom";
import _package from './../package';
import Detail from './components/detail'
import Settings from './components/settings'
import Watch from './components/watch'
import Menu from './components/layout/menu'
import Task from './components/task';
import LTask from './components/ltask';
import WatchSingle from './components/watch/single'
import './utils/i18n';
import { TaskProvider, useTask } from './context/tasker';

const router = createHashRouter([
  {
    path: "/",
    element: <Menu />,
    children: [
      {
        path: "/",
        element: <LTask />,
      },
      {
        path: "/watch",
        element: <Watch />,
      },
      {
        path: "/task",
        element: <Task />,
      },
      {
        path: "/settings",
        element: <Settings />,
      }
    ],
  },{
    path: "/watch/single",
    element: <WatchSingle />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainContextProvider>
      <TaskProvider>
        <RouterProvider router={router}/>
      </TaskProvider>
    </MainContextProvider>
  </React.StrictMode>
)