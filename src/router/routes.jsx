import React from 'react';
import LTask from '../components/ltask';
import Watch from '../components/watch';
import Task from '../components/task';
import Settings from '../components/settings';
import WatchSingle from '../components/watch/single';
import SearchSettings from '../components/settings/search';
import KeywordSettings from '../components/settings/keywords';
import Detail from '../components/detail';

// 路由配置项说明：
// path: 路由路径
// name: 菜单显示名称 (用于侧边栏)
// icon: 图标名称 (用于侧边栏)
// element: 页面组件
// hideInMenu: 是否在侧边栏隐藏
// meta: {
//   showHeader: 是否显示顶部 Header
//   showSidebar: 是否显示侧边栏 (控制 Layout 行为)
//   showMod: 显示模式 [0, 1] 等
// }

export const routes = [
    {
        path: "/",
        name: "本地任务",
        icon: "LaptopIcon",
        element: <LTask />,
        handle: {
            showMod: [1],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/watch",
        name: "在线观看",
        icon: "RemoveRedEyeIcon",
        element: <Watch />,
        handle: {
            showMod: [1],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/task",
        name: "定时检查任务",
        icon: "CloudQueueIcon",
        element: <Task />,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/settings",
        name: "设置",
        icon: "SettingsIcon",
        handle: {
            showMod: [0, 1],
            showHeader: true,
            showSidebar: true
        },
        children: [
            {
                path: "/settings",
                index: true,
                element: <Settings />, // 默认显示基础设置，或者重定向
                hideInMenu: true, // 父级菜单点击后的默认行为，这里暂不处理，react-router 会匹配 index
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/basic",
                name: "基础设置",
                icon: "PublicIcon",
                element: <Settings />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/search",
                name: "爬取配置",
                icon: "SearchIcon",
                element: <SearchSettings />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/keywords",
                name: "频道名替换",
                icon: "StickyNote2Icon",
                element: <KeywordSettings />,
                handle: { showHeader: true, showSidebar: true }
            }
        ]
    },
    // 不在菜单中显示的路由
    {
        path: "/detail",
        element: <Detail />,
        hideInMenu: true,
        handle: {
            showHeader: false,
            showSidebar: true
        }
    },
    {
        path: "/watch/single",
        element: <WatchSingle />,
        hideInMenu: true,
        handle: {
            showHeader: false,
            showSidebar: false
        }
    }
];

