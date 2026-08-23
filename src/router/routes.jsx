import React from 'react';
import { Navigate } from 'react-router-dom';
import LTask from '../components/ltask';
import Watch from '../components/watch';
import Task from '../components/task';
import Settings from '../components/settings';
import WatchSingle from '../components/watch/single';
import SearchSettings from '../components/settings/search';
import KeywordSettings from '../components/settings/keywords';
import FavoriteSettings from '../components/favourite';
import EpgChannelSearch from '../components/favourite/epg-search';
import ChannelLogos from '../components/settings/logos';
import CrawledLogosPage from '../components/settings/crawled-logos';
import Detail from '../components/detail';
import Welcome from '../components/welcome';
import DonateSettings from '../components/settings/donate';
import BackupSettings from '../components/settings/backup';
import EpgSettings from '../components/settings/epg';
import NetworkSettings from '../components/settings/network';
import GroupMapping from '../components/settings/group';
import HistoryPage from '../components/history';
import CheckSettings from '../components/settings/check';
import FavouriteChannelsPage from '../components/favourite-channels';
import RelayPage from '../components/relay';
import SnapshotsPage from '../components/snapshots';
import PlayIntro from '../components/play/intro';

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
        name: "欢迎",
        icon: "HomeOutlinedIcon",
        element: <Welcome />,
        handle: {
            showMod: [0,1],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/local",
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
        path: "/favorite",
        name: "想看的频道",
        icon: "FavoriteBorderIcon",
        element: <FavoriteSettings />,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/epg-channel-search",
        name: "EPG节目单",
        icon: "LiveTvIcon",
        element: <EpgChannelSearch />,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/settings/logos",
        name: "频道图标",
        icon: "PhotoLibraryIcon",
        element: <ChannelLogos />,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/favorite/epg-search",
        element: <Navigate to="/epg-channel-search" replace />,
        hideInMenu: true,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/play",
        name: "播放设置",
        icon: "PlayCircleOutlineIcon",
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        },
        children: [
            {
                path: "/play",
                index: true,
                element: <PlayIntro />,
                hideInMenu: true,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/play/intro",
                name: "播放介绍",
                icon: "HomeOutlinedIcon",
                element: <PlayIntro />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/play/relay",
                name: "流畅模式",
                icon: "SpeedIcon",
                element: <RelayPage />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/play/snapshots",
                name: "频道画面",
                icon: "PhotoLibraryIcon",
                element: <SnapshotsPage />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/play/favourite-channels",
                name: "收藏的频道",
                icon: "FavoriteBorderIcon",
                element: <FavouriteChannelsPage />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/play/history",
                name: "历史记录",
                icon: "HistoryIcon",
                element: <HistoryPage />,
                handle: { showHeader: true, showSidebar: true }
            }
        ]
    },
    {
        path: "/settings",
        name: "设置",
        icon: "SettingsOutlinedIcon",
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
                path: "/settings/keywords",
                name: "特殊字符替换",
                icon: "StickyNote2Icon",
                element: <KeywordSettings />,
                hideInMenu: true,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/search",
                name: "爬取源配置",
                icon: "SearchIcon",
                element: <SearchSettings />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/crawled-logos",
                name: "爬取频道图标",
                icon: "PhotoLibraryIcon",
                element: <CrawledLogosPage />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/network",
                name: "网络设置",
                icon: "HubIcon",
                element: <NetworkSettings />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/epg",
                name: "EPG 配置",
                icon: "TvIcon",
                element: <EpgSettings />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/check",
                name: "定时检查配置",
                icon: "BlockIcon",
                element: <CheckSettings />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/group",
                name: "分组映射",
                icon: "StickyNote2Icon",
                element: <GroupMapping />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/backup",
                name: "备份与恢复",
                icon: "SettingsBackupRestoreIcon",
                element: <BackupSettings />,
                handle: { showHeader: true, showSidebar: true }
            },
            {
                path: "/settings/donate",
                name: "捐赠",
                icon: "VolunteerActivismIcon",
                element: <DonateSettings />,
                handle: { showHeader: true, showSidebar: true }
            }
        ]
    },
    // 不在菜单中显示的路由
    // 旧路径兼容跳转（播放相关页面已移入「播放设置」）
    {
        path: "/relay",
        element: <Navigate to="/play/relay" replace />,
        hideInMenu: true,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/snapshots",
        element: <Navigate to="/play/snapshots" replace />,
        hideInMenu: true,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/favourite-channels",
        element: <Navigate to="/play/favourite-channels" replace />,
        hideInMenu: true,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
    {
        path: "/history",
        element: <Navigate to="/play/history" replace />,
        hideInMenu: true,
        handle: {
            showMod: [0],
            showHeader: true,
            showSidebar: true
        }
    },
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

