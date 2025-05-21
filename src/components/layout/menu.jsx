import * as React from 'react';
import { useEffect, useState, useContext } from "react"
import { useNavigate, useLocation } from 'react-router-dom';
import { Outlet } from "react-router-dom";
import './menu.css'
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import LaptopIcon from '@mui/icons-material/Laptop';
import LoadingButton from '@mui/lab/LoadingButton';
import { MainContext } from './../../context/main';
import icon from './../../assets/icon.png';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import BoltIcon from '@mui/icons-material/Bolt';
import SettingsIcon from '@mui/icons-material/Settings';
import AdjustIcon from '@mui/icons-material/Adjust';
import PublicIcon from '@mui/icons-material/Public';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import _package from './../../../package';
import { useTranslation, initReactI18next } from "react-i18next";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import Divider from '@mui/material/Divider';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import DehazeIcon from '@mui/icons-material/Dehaze';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

let menuList = [{
    "name": "本地检查",
    "uri": "/",
    "icon": "LaptopIcon",
    'showMod': [0, 1],
    'showHeader': true
}, {
    "name": "已检测源",
    "uri": "/detail",
    "icon": "AdjustIcon",
    'showMod': [0, 1],
    'showHeader': true
}, {
    "name": "在线观看",
    "uri": "/watch",
    "icon": "RemoveRedEyeIcon",
    'showMod': [1],
    'showHeader': true
}, {
    "name": "定时检查任务",
    "uri": "/task",
    "icon": "CloudQueueIcon",
    'showMod': [0, 1],
    'showHeader': true
}]

const detailUri = '/detail'


const drawerWidth = 240;

export default function Layout() {
    const { t } = useTranslation();
    let location = useLocation();
    const _mainContext = useContext(MainContext);
    const navigate = useNavigate();
    const [nowSelectedMenu, setNowSelectedMenu] = useState(menuList[0])
    const [openSubCheckedMenu, setOpenSubCheckedMenu] = useState(false)
    const [nowSelectedCheckedMenu, setNowSelectedCheckedMenu] = useState(null)
    const [openDrawer, setOpenDrawer] = useState(true);
    const [showSponsor, setShowSponsor] = useState(false);
    const [nowSelectSponsor, setNowSelectSponsor] = useState('')
    const [sponsorInfo, setSponsorInfo] = useState(null)

    useEffect(() => {
        if (location.pathname == detailUri) {
            setNowSelectedMenu({ 'showHeader': false })
        } else {
            _mainContext.updateDetailMd5("")
            for (let i = 0; i < menuList.length; i++) {
                if (location.pathname == menuList[i].uri) {
                    setNowSelectedMenu(menuList[i])
                }
            }
        }
    }, [location])

    const nowVersion = _package.version;

    const changePath = (e) => {
        if (e.uri === detailUri) {
            setOpenSubCheckedMenu(!openSubCheckedMenu)
        } else {
            setNowSelectedMenu(e)
            navigate(e.uri)
        }
    }

    const changeCheckedPath = (e) => {
        setNowSelectedCheckedMenu(e)
        navigate(detailUri + "?md5=" + e.md5)
    }

    const goToGithub = () => {
        window.open(_package.homepage_url)
    }

    const toggleDrawer = (newOpen) => () => {
        setOpenDrawer(newOpen);
    };

    const handleShowSponsor = () => {
        setShowSponsor(true)
        let data = null
        for (let i = 0; i < _mainContext.configInfo.sponsor.length; i++) {
            if (_mainContext.configInfo.sponsor[i].name === nowSelectSponsor) {
                data = _mainContext.configInfo.sponsor[i]
            }
        }
        setSponsorInfo(data)
    }

    const handleCloseSponsor = () => {
        setShowSponsor(false)
    }

    const changeSponsorType = (e) => {
        setNowSelectSponsor(e.target.value)
    }

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light',
                    sideBarBgColor: {
                        dark: '#021d2a',
                        light: 'antiquewhite'
                    }
                },
            }),
        [prefersDarkMode],
    );

    const DrawerList = (
        <Box className="side-bar" style={{ backgroundColor: theme.palette.sideBarBgColor[prefersDarkMode ? 'dark' : 'light'] }} sx={{ width: drawerWidth }} role="presentation">
            <List>
                <Box className="side-bar-logo" onClick={goToGithub} title='帮忙点个star!!!'>
                    <Box className='side-bar-logo-item'>
                        <img src={icon} height="60"></img>
                        <Box className='go-github'>iptv-checker@{nowVersion}</Box>
                        {
                            _mainContext.showNewVersion ? (
                                <Box style={{ color: 'red' }}>有新版本:{_mainContext.configInfo.version}</Box>
                            ) : ''
                        }
                    </Box>
                </Box>
                {
                    menuList.map((value, index) => (
                        value.showMod.includes(_mainContext.nowMod) ? (
                            <Box key={index}>
                                {
                                    value.uri !== detailUri || (value.uri === detailUri && _mainContext.subCheckMenuList.length > 0) ? (
                                        <ListItem key={index} disablePadding onClick={() => changePath(value)}>
                                            <ListItemButton>
                                                <ListItemIcon>
                                                    {
                                                        value.icon === 'LaptopIcon' ? <LaptopIcon />:''
                                                    }
                                                    {
                                                        value.icon === 'SettingsIcon' ? <SettingsIcon /> : ''
                                                    }
                                                    {
                                                        value.icon === 'AdjustIcon' ? <AdjustIcon /> : ''
                                                    }
                                                    {
                                                        value.icon === 'PublicIcon' ? <PublicIcon /> : ''
                                                    }
                                                    {
                                                        value.icon === 'CloudQueueIcon' ? <CloudQueueIcon /> : ''
                                                    }
                                                    {
                                                        value.icon === 'RemoveRedEyeIcon' ? <RemoveRedEyeIcon /> : ''
                                                    }
                                                    {
                                                        value.icon === 'BoltIcon' ? <BoltIcon /> : ''
                                                    }
                                                </ListItemIcon>
                                                <ListItemText primary={t(value.name)} />
                                                {
                                                    value.uri === detailUri ? (
                                                        openSubCheckedMenu ? <ExpandLess /> : <ExpandMore />
                                                    ) : ''
                                                }
                                            </ListItemButton>
                                        </ListItem>
                                    ) : ''
                                }

                                {
                                    value.uri === detailUri && openSubCheckedMenu ? (
                                        <List component="div" disablePadding key={detailUri + "0000"}>
                                            {
                                                _mainContext.subCheckMenuList.map((value, index) => (
                                                    <ListItemButton sx={{ pl: 4 }} key={detailUri + index} onClick={() => changeCheckedPath(value)}>
                                                        <ListItemText primary={value.md5} />
                                                    </ListItemButton>
                                                ))
                                            }
                                        </List>
                                    ) : ''
                                }
                            </Box>
                        ) : ''
                    ))}
            </List>
            {
                _mainContext.configInfo.sponsor.length > 0 ? (
                    <FormControl sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop: '20px'
                    }}>
                        <FormLabel id="demo-radio-buttons-group-label">{t('请开发者喝杯咖啡☕️')}</FormLabel>
                        <RadioGroup
                            aria-labelledby="demo-radio-buttons-group-label"
                            name="radio-buttons-group"
                            onChange={changeSponsorType}
                            value={nowSelectSponsor}
                        >
                            {
                                _mainContext.configInfo.sponsor.map((value, index) => (
                                    <FormControlLabel key={index} value={value.name} control={<Radio />} label={value.name} />
                                ))
                            }
                        </RadioGroup>
                        {
                            nowSelectSponsor !== '' ? (
                                <LoadingButton
                                    onClick={handleShowSponsor}
                                    variant="outlined"
                                >
                                    {t('点击赞助')}
                                </LoadingButton>
                            ) : ''
                        }
                    </FormControl>
                ) : ''
            }

        </Box>
    );

    const getQueryParam = (location, key) => {
        // 使用 URLSearchParams 获取查询参数
        const params = new URLSearchParams(location.search);

        // 获取对应的值
        return params.get(key);
    }

    const remove_detail = (md5Str) => {
        _mainContext.delDetailData(md5Str)
        navigate("/")
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SimpleDialog
                open={showSponsor}
                sponsorInfo={sponsorInfo}
                onClose={handleCloseSponsor}
            />
            <Box className="layout">
                <Drawer open={openDrawer} anchor="left" variant={openDrawer ? "permanent" : 'temporary'}>
                    {DrawerList}
                </Drawer>
                <Box className="container-inner" style={{
                    marginLeft: openDrawer ? drawerWidth + "px" : '',
                }}>
                    <Box data-tauri-drag-region style={{ width: '100%', height: '20px' }}></Box>
                    {
                        <Box style={{
                            padding: '0 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            height: '60px',
                        }}>
                            <Box style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                height: '60px',
                                width: '100%'
                            }}>
                                <Box style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Box>
                                        <IconButton aria-label="delete" size="small" onClick={toggleDrawer(!openDrawer)}>
                                            <DehazeIcon />
                                        </IconButton>
                                    </Box>
                                    <Box style={{ fontWeight: 'bold', fontSize: '20px' }}>{
                                        nowSelectedMenu.name !== null && nowSelectedMenu.name !== undefined ?
                                            t(nowSelectedMenu.name) : _mainContext.detailMd5
                                    }</Box>
                                    {
                                        _mainContext.detailMd5 !== '' ? (
                                            <IconButton aria-label="delete" color='error' size="small" onClick={() => remove_detail(_mainContext.detailMd5)}>
                                                <HighlightOffIcon />
                                            </IconButton>
                                        ) : ''
                                    }
                                </Box>
                                <Box data-tauri-drag-region style={{
                                    display: _mainContext.nowMod === 1 ? 'flex' : 'none',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Box className="titlebar-button" id="titlebar-minimize">
                                        <img
                                            src="https://api.iconify.design/mdi:window-minimize.svg"
                                            alt="minimize"
                                        />
                                    </Box>
                                    <Box className="titlebar-button" id="titlebar-close">
                                        <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    }
                    <Box style={{ width: '100%', height: '20px' }}></Box>
                    <Divider style={{ marginBottom: '10px' }} />
                    <Outlet />
                </Box>
            </Box>
        </ThemeProvider>
    )
}

function SimpleDialog(props) {
    const { t } = useTranslation();
    const { onClose, sponsorInfo, open } = props;

    const handleClose = () => {
        onClose();
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>{t('支持开发者开发继续维护该项目')}</DialogTitle>
            {
                sponsorInfo !== null && sponsorInfo.url !== '' ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <img src={sponsorInfo.url} height="400" />
                    </Box>
                ) : ''
            }
        </Dialog>
    );
}