import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { MainContextProvider } from './context/main'
import {
  RouterProvider,
  createHashRouter,
  createBrowserRouter
} from "react-router-dom";
import Detail from './components/detail'
import Watch from './components/watch'
import Menu from './components/layout/menu'
import Settings from './components/settings';
import Task from './components/task';
import LTask from './components/ltask';
import Check from './components/check';
import Fast from './components/fast';
import Public from './components/public';
import WatchSingle from './components/watch/single'
import './utils/i18n';
import { TaskProvider,useTasks } from './context/tasker';
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
        path: "/detail",
        element: <Detail />,
      },
      {
        path: "/watch",
        element: <Watch />,
      },
      {
        path: "/task",
        element: <Task />,
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
        <RouterProvider router={router} />
      </TaskProvider>
    </MainContextProvider>
  </React.StrictMode>
)