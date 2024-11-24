import { useState, createContext, useEffect, useRef } from "react"
import axios from "axios"
export const MainContext = createContext();
import ParseM3u from '../utils/utils'
import { invoke } from '@tauri-apps/api/core'
import i18n from "i18next";
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import { overrideGlobalXHR } from 'tauri-xhr'
import { LogicalSize } from '@tauri-apps/api/window';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { type } from '@tauri-apps/plugin-os';

export const MainContextProvider = function ({ children }) {
    const headerHeight = 145
    const [originalM3uBody, setOriginalM3uBody] = useState('');//原始的m3u信息
    const [showM3uBody, setShowM3uBody] = useState([])//m3u信息转换成list 数组
    const [hasCheckedCount, setHasCheckedCount] = useState(0)//当前检查进度
    const [uGroups, setUGroups] = useState([])//当前分组
    const [exportData, setExportData] = useState([])//待导出数据json
    const [exportDataStr, setExportDataStr] = useState('')//导出数据的str
    const [checkUrlMod, setCheckUrlMod] = useState(0)//检查当前链接是否有效模式 0未在检查中 1正在检查 2暂停检查
    const [handleMod, setHandleMod] = useState(0);//当前的操作模式 0无操作 1操作处理检查 2检查完成
    const [checkData, setCheckData] = useState([])//待检查数据列表
    const [videoResolution, setVideoResolution] = useState([])//视频分辨率筛选
    const [needFastSource, setNeedFastSource] = useState(false)// 是否选择最快的源, false否， true是
    const [nowMod, setNowMod] = useState(0);// 当前运行模式 0服务端模式 1客户端模式
    const [nowLanguage, setNowLanguage] = useState('en')
    const [nowWindow, setNowWindow] = useState({ width: 0, height: 0 })
    const [nowPlatform, setNowPlatform] = useState('')
    const [showWindowsTopBar, setShowWindowsTopBar] = useState(true)
    const [subCheckMenuList, setSubCheckMenuList] = useState([
        {
            "md5":"xxxxx11",
            "data":[],
            "original":[]
        },{
            "md5":"xxxxx222",
            "data":[],
            "original":[]
        }])
    const [videoPlayTypes, setVideoPlayTypes] = useState([
        {
            "name": "mac",
            "value": "application/x-mpegURL"
        }
        , {
            "name": "windows",
            "value": "video/mp2t"
        }
    ])
    const [languageList, setLanguageList] = useState([{
        'code': 'en',
        "name": "English"
    }, {
        'code': 'zh',
        "name": "中文"
    }])

    const [settings, setSettings] = useState({
        checkSleepTime: 300,// 检查下一次请求间隔(毫秒)
        httpRequestTimeout: 8000,// http请求超时,0表示 无限制
        customLink: [],//自定义配置
        concurrent: 1,//并发数
        language: 'en',//语言
        privateHost: '',//私有host
        playerSource: "application/x-mpegURL",// 视频播放平台
    })

    const nowCheckUrlModRef = useRef()//当前操作类型
    const hasCheckedCountRef = useRef()//同handleMod
    const videoInfoRef = useRef({})//视频宽高、延迟数据
    const videoFastNameMapRef = useRef({})//存储名字对应的最低延迟数据

    let debugMode = true

    const log = (...args) => {
        if (debugMode) {
            console.log(...args)
        }
    }

    const changeLanguage = (val) => {
        setNowLanguage(val)
        i18n.changeLanguage(val)
    }

    const initControlBar = (appWindow, pageLabel) => {
        document
            .getElementById('titlebar-minimize')
            ?.addEventListener('click', () => appWindow.minimize());
        document
            .getElementById('titlebar-maximize')
            ?.addEventListener('click', () => {
                appWindow.isFullscreen().then((isFull) => {
                    console.log("isfull", isFull);
                    if (isFull) {
                        appWindow.setSize(new LogicalSize(1024, 800)).then(() => { })
                    } else {
                        appWindow.setTitleBarStyle('transparent')
                        appWindow.setFullscreen(true)
                        appWindow.center()
                        setShowWindowsTopBar(false)
                    }
                })
            });
        document
            .getElementById('titlebar-close')
            ?.addEventListener('click', () => appWindow.close());
    }

    const initTitleBar = () => {
        const appWindow = getCurrentWebviewWindow()
        initControlBar(appWindow)
    }

    const clientSaveFile = async (body, fuleSuffix) => {
        const downloadDirPath = await downloadDir();
        let download_name = downloadDirPath + 'iptv-checker-file-' + new Date().getTime() + "." + fuleSuffix
        const filePath = await save({
            defaultPath: download_name,
            filters: [{
                name: download_name,
                extensions: [fuleSuffix]
            }]
        });
        filePath && await writeTextFile(download_name, body)
    }

    useEffect(() => {
        setNowWindow({ width: window.innerWidth, height: window.innerHeight })
        window.addEventListener('resize', () => {
            setNowWindow({ width: window.innerWidth, height: window.innerHeight })
        })
        invoke('now_mod', {}).then((response) => {
            setNowMod(response)
            initTitleBar()
            console.log("now mod", response)
            let os_type = type()
            if (os_type !== '') {
                console.log("now os type", os_type)
                setNowPlatform(os_type)
            }
        }).catch(e => {
            console.log(e)
        })
        let setting = localStorage.getItem('settings') ?? ''
        if (setting !== '') {
            try {
                let data = JSON.parse(setting)
                changeLanguage(data.language)
                setSettings(data)
            } catch (e) {
                console.log(e)
            }
        }
        hasCheckedCountRef.current = 0
    }, [])

    const onChangeNeedFastSource = (val) => {
        setNeedFastSource(val)
    }

    // 解析m3u8文件， 类似：https://xxxx.m3u8, https://xxx2.m3u8
    const getBodyTypeM3u8List = async (body) => {
        let rows = body.split(',');
        let result = [];
        for (let i = 0; i < rows.length; i++) {
            if (isValidUrl(rows[i]) && rows[i].includes(".m3u8")) {
                let name = 'channel ' + i
                let originalData = `#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Undefined",` + name + `\n` + rows[i]
                let raw = `#EXTINF:-1 tvg-id="" tvg-logo="" group-title="Undefined",` + name + `\n` + rows[i]
                let data = ParseM3u.buildM3uBaseObject(i, rows[i],
                    "Undefined", "", "", "", "",
                    name, originalData, raw)
                result.push(data)
            }
        }
        if (result.length == 0) {
            return []
        }
        return combine_m3u_list(result)
    }

    const combine_m3u_list = (rows) => {
        let body = [];
        for (let i = 0; i < rows.length; i++) {
            body.push(rows[i].raw)
        }
        return body
    }

    const isValidUrl = (url) => {
        const pattern = new RegExp('^(https?:\\/\\/)?' + // 协议
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // 域名
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // 或者IP地址
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // 端口和路径
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // 查询字符串
            '(\\#[-a-z\\d_]*)?$', 'i'); // 锚点
        return pattern.test(url);
    }

    // 解析m3u文件，类似 https://xxxx.m3u, https://xxxx.m3u
    const getBodyTypeM3uList = async (body) => {
        let rows = body.split(',');
        let urls = []
        for (let i = 0; i < rows.length; i++) {
            if (isValidUrl(rows[i]) && rows[i].includes(".m3u")) {
                urls.push(rows[i])
            }
        }
        let allRequest = [];
        for (let i = 0; i < urls.length; i++) {
            let _url = getM3uBody(urls[i])
            allRequest.push(axios.get(_url, { timeout: settings.httpRequestTimeout }))
        }
        const results = await Promise.allSettled(allRequest);

        let bodies = []
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const response = result.value.data;
                try {
                    let values = ParseM3u.parseOriginalBodyToList(response)
                    for (let i = 0; i < values.length; i++) {
                        bodies.push(values[i])
                    }
                } catch (err) {
                    console.log('err', err)
                }
            }
        })
        return combine_m3u_list(bodies)
    }

    // 解析text文件，类似 xxxx, https://xxx.m3u8
    const getBodyTypeText = async (body) => {
        try {
            let result = ParseM3u.parseQuoteFormat(body)
            return combine_m3u_list(result)
        } catch (e) {
            return []
        }
    }

    const getBodyType = async (body) => {
        let arr = [
            getBodyTypeM3u8List,
            getBodyTypeM3uList,
            getBodyTypeText,
        ]
        let result = [];
        let hitValue = false
        for (const element of arr) {
            if (!hitValue) {
                let value = await element(body);
                if (value.length > 0) {
                    hitValue = true
                    result = value
                }
            }
        }
        if (result.length > 0) {
            let resultStr = '#EXTM3U\n'
            return resultStr + result.join('\n')
        } else {
            return body
        }
    }

    const onChangeSettings = (value) => {
        localStorage.setItem("settings", JSON.stringify(value))
        setSettings(value);
    }

    const changeVideoResolution = (val) => {
        setVideoResolution(val)
    }

    const clearDetailData = () => {
        setHasCheckedCount(0)
        hasCheckedCountRef.current = 0
        setExportDataStr('')
        setHandleMod(0)
        setCheckUrlMod(0)
        setShowM3uBody([])
        setOriginalM3uBody('')
        nowCheckUrlModRef.current = 0
        videoInfoRef.current = {}
        videoFastNameMapRef.current = {}
    }

    const contains = (str, substr) => {
        return str.indexOf(substr) != -1;
    }

    const parseUrlHost = (str) => {
        const url = new URL(str)
        return url.hostname
    }

    const deleteShowM3uRow = (index) => {
        setShowM3uBody(prev => prev.filter((v, i) => v.index !== index))
    }

    const getSelectedGroupTitle = () => {
        let row = []
        for (let i = 0; i < uGroups.length; i++) {
            if (uGroups[i].checked) {
                row.push(uGroups[i].key)
            }
        }
        return row
    }

    const inArray = (arr, val) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === val) {
                return true
            }
        }
        return false
    }

    const videoResolutionGetChecked = () => {
        let save = []
        for (let i = 0; i < videoResolution.length; i++) {
            if (videoResolution[i].checked) {
                save.push(videoResolution[i].value)
            }
        }
        return save
    }

    const filterM3u = (filterNames) => {
        let selectedGroupTitles = getSelectedGroupTitle()
        let videoResArr = videoResolutionGetChecked()
        if (filterNames.length === 0 && selectedGroupTitles.length === 0 && videoResArr.length === 0) {
            setShowM3uBody(ParseM3u.parseOriginalBodyToList(originalM3uBody, videoInfoRef.current))
            return
        }
        let temp = ParseM3u.parseOriginalBodyToList(originalM3uBody, videoInfoRef.current)
        let rows = [];
        let _index = 1
        for (let i = 0; i < temp.length; i++) {
            // 检查当前视频清晰度是否命中
            let hitVideoRes = true
            if (videoResArr.length > 0 && temp[i].videoType != "") {
                hitVideoRes = false
                for (let v = 0; v < videoResArr.length; v++) {
                    if (temp[i].videoType === videoResArr[v]) {
                        hitVideoRes = true
                    }
                }
            }
            // 搜索名称是否命中
            let hitTitleSearch = true
            if (filterNames.length > 0) {
                hitTitleSearch = false
                for (let j = 0; j < filterNames.length; j++) {
                    if (contains(temp[i].sName, filterNames[j].toLowerCase())) {
                        hitTitleSearch = true
                    }
                }
            }
            // group是否命中
            let hitGroup = true
            if (selectedGroupTitles.length > 0) {
                hitGroup = false
                if (inArray(selectedGroupTitles, temp[i].groupTitle)) {
                    hitGroup = true
                }
            }
            if (hitGroup && hitVideoRes && hitTitleSearch) {
                let one = temp[i]
                one.index = _index
                rows.push(one);
                _index++
            }
        }
        log("setShowM3uBody---", rows)
        setShowM3uBody(rows)
    }

    const strToCsv = (body) => {
        let _res = ParseM3u.parseOriginalBodyToList(body)
        let csvBodyArr = []
        csvBodyArr.push(["名称", "链接", "分组", "台标"])
        for (let i = 0; i < _res.length; i++) {
            csvBodyArr.push([_res[i].name, _res[i].url, _res[i].groupTitle, _res[i].tvgLogo])
        }
        return csvBodyArr
    }

    const changeOriginalM3uBody = (body) => {
        clearDetailData()
        setOriginalM3uBody(body);
        let _res = ParseM3u.parseOriginalBodyToList(body)
        setShowM3uBody(_res)
        parseGroup(_res)
    }

    const parseGroup = (groupList) => {
        let _group = {}
        for (let i = 0; i < groupList.length; i++) {
            _group[groupList[i].groupTitle] = groupList[i].groupTitle
        }
        let _tempGroup = []
        for (let i in _group) {
            _tempGroup.push({
                key: _group[i],
                checked: false
            })
        }
        setUGroups(_tempGroup)
    }

    const addGroup = (name) => {
        let exists = false
        for (let i = 0; i < uGroups.length; i++) {
            if (uGroups[i].key === name) {
                exists = true
            }
        }
        if (!exists) {
            let row = deepCopyJson(uGroups)
            row.push({
                key: name,
                checked: false
            })
            setUGroups(row)
        }
    }

    const changeOriginalM3uBodies = (bodies) => {
        let res = []
        let bodyStr = ''
        let index = 1;
        for (let i = 0; i < bodies.length; i++) {
            bodyStr += bodies[i] + "\n"
            let one = ParseM3u.parseOriginalBodyToList(bodies[i])
            for (let j = 0; j < one.length; j++) {
                one[j].index = index
                res.push(one[j])
                index++
            }
        }
        clearDetailData()
        setShowM3uBody(res)
        parseGroup(res)
        setOriginalM3uBody(bodyStr);
    }

    const deepCopyJson = (obj) => {
        return JSON.parse(JSON.stringify(obj))
    }

    const setShowM3uBodyStatus = (index, status, videoObj, audioObj, delay) => {
        setShowM3uBody(list =>
            list.map((item, idx) => {
                if (item.index === index) {
                    let videoType = ''
                    if (videoObj !== null) {
                        videoType = ParseM3u.getVideoResolution(videoObj.width, videoObj.height)
                    }
                    let data = {
                        ...item,
                        status: status,
                        video: videoObj,
                        audio: audioObj,
                        videoType: videoType,
                        delay: delay,
                    };
                    return data
                }
                return item;
            })
        )
    }

    const setShowM3uBodyStatusByOri = (data, index, status, videoObj, audioObj, delay) => {
        console.log("data", data)
        for (let i = 0; i < data.length; i++) {
            if (data[i].index === index) {
                let videoType = ''
                if (videoObj !== null) {
                    videoType = ParseM3u.getVideoResolution(videoObj.width, videoObj.height)
                }
                let item = {
                    ...data[i],
                    status: status,
                    video: videoObj,
                    audio: audioObj,
                    videoType: videoType,
                    delay: delay,
                };
                data[i] = item
            }
        }
        return data
    }

    const setCheckDataStatus = (index, status) => {
        setCheckData(prev =>
            prev.map((item, idx) => idx === index ? { ...item, status: status } : item)
        )
    }

    const onExportValidM3uData = () => {
        let _export = []
        for (let i = 0; i < showM3uBody.length; i += 1) {
            if (showM3uBody[i].checked) {
                _export.push(showM3uBody[i])
            }
        }
        setExportData(_export)
    }

    const changeDialogBodyData = () => {
        setExportDataStr(originalM3uBody)
    }

    const onSelectedRow = (index) => {
        let updatedList = [...showM3uBody]
        const objIndex = updatedList.findIndex(obj => obj.index == index);
        updatedList[objIndex].checked = !updatedList[objIndex].checked;
        setShowM3uBody(updatedList)
    }

    const findM3uBodyByIndex = (index) => {
        let updatedList = [...showM3uBody]
        const objIndex = updatedList.findIndex(obj => obj.index == index);
        return showM3uBody[objIndex]
    }

    const findM3uBodyByIndexByOri = (data, index) => {
        let updatedList = [...data]
        const objIndex = updatedList.findIndex(obj => obj.index == index);
        return data[objIndex]
    }

    const onSelectedOrNotAll = (mod) => {
        //mod = 1选择 0取消选择
        if (mod === 1) {
            setShowM3uBody(prev => prev.map((item, _) =>
                true ? { ...item, checked: true } : ''
            ))
        } else {
            setShowM3uBody(prev => prev.map((item, _) =>
                true ? { ...item, checked: false } : ''
            ))
        }
    }

    const getAvailableOrNotAvailableIndex = (mod) => {
        //mod == 1 有效 2无效
        let ids = []
        let updatedList = [...showM3uBody]
        for (let i = 0; i < updatedList.length; i++) {
            let isChecked = false
            // 需要最快延迟的数据
            if (needFastSource) {
                if (showM3uBody[i].status === mod) {
                    if (videoFastNameMapRef.current[showM3uBody[i].sName] === undefined) {
                        isChecked = true
                    } else {
                        if (videoFastNameMapRef.current[showM3uBody[i].sName].index === updatedList[i].index) {
                            isChecked = true
                        }
                    }
                }
            } else {
                if (showM3uBody[i].status === mod) {
                    isChecked = true
                }
            }
            if (isChecked) {
                updatedList[i].checked = true
                ids.push(showM3uBody[i].index)
            } else {
                updatedList[i].checked = false
            }
        }
        setShowM3uBody(updatedList)
        return ids
    }

    const getCheckUrl = (url, timeout) => {
        if (nowMod === 1) {
            return url
        }
        let _timeout = parseInt(timeout, 10)
        return '/check/url-is-available?url=' + url + "&timeout=" + (isNaN(_timeout) ? '-1' : _timeout)
    }

    const getM3uBody = (url, timeout) => {
        if (nowMod === 1) {
            return url
        }
        let _timeout = parseInt(timeout, 10)
        log(url, _timeout)
        return '/fetch/m3u-body?url=' + url + "&timeout=" + (isNaN(_timeout) ? '-1' : _timeout)
    }

    const prepareCheckData = () => {
        let _temp = deepCopyJson(showM3uBody)
        setCheckData(_temp)
        return _temp
    }

    const sleep = (time) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    const chunkArray = (arr, chunkSize) => {
        const chunkedArray = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            chunkedArray.push(arr.slice(i, i + chunkSize));
        }
        return chunkedArray;
    }

    const doCheck = async (data) => {
        let arr = chunkArray(data, settings.concurrent)
        if (nowMod === 1) {
            console.log("start check")
            for (let i = 0; i < arr.length; i++) {
                if (nowCheckUrlModRef.current === 2) {
                    continue
                }
                let nowData = [];
                let allRequest = [];
                for (let j = 0; j < arr[i].length; j++) {
                    let nowItem = arr[i][j]
                    let getData = findM3uBodyByIndex(nowItem.index)
                    if (getData.status !== 0) {
                        log("do check status != 0")
                        continue
                    }
                    nowData.push(arr[i][j])
                    allRequest.push(axios.get(arr[i][j].url, { timeout: settings.httpRequestTimeout }))
                }
                if (allRequest.length == 0) {
                    continue
                }
                const results = await Promise.allSettled(allRequest);
                results.forEach((result, index) => {
                    let videoInfoMap = videoInfoRef.current
                    let one = nowData[index];
                    if (result.status === 'fulfilled') {
                        const response = result.value;
                        let delay = -1;
                        videoInfoMap[one.url] = {
                            "video": null,
                            "audio": null,
                            "videoType": null,
                            "status": 1,
                            'delay': delay,
                        }
                        let videoFastNameMap = videoFastNameMapRef.current
                        if (videoFastNameMap[one.sName] === undefined || videoFastNameMap[one.sName] === null) {
                            videoFastNameMap[one.sName] = {
                                index: one.index,
                                delay: delay
                            }
                        } else {
                            if (videoFastNameMap[one.sName].delay >= delay) {
                                videoFastNameMap[one.sName] = {
                                    index: one.index,
                                    delay: delay
                                }
                            }
                        }
                        setShowM3uBodyStatus(one.index, 1, null, null, delay)
                        setCheckDataStatus(one.index, 1)
                    } else {
                        videoInfoMap[one.url] = {
                            "status": 2,
                        }
                        setShowM3uBodyStatus(one.index, 2, null, null, 0)
                        setCheckDataStatus(one.index, 2)
                    }
                });
                hasCheckedCountRef.current += settings.concurrent
                setHasCheckedCount(hasCheckedCountRef.current)
            }
            console.log("end check")
        } else {
            console.log("start server check")
            for (let i = 0; i < arr.length; i++) {
                console.log("----now", arr[i])
                if (nowCheckUrlModRef.current === 2) {
                    continue
                }
                let nowData = [];
                let allRequest = [];

                for (let j = 0; j < arr[i].length; j++) {
                    let nowItem = arr[i][j]
                    let getData = findM3uBodyByIndex(nowItem.index)
                    if (getData.status !== 0) {
                        log("do check status != 0")
                        continue
                    }
                    nowData.push(arr[i][j])
                    let _url = getCheckUrl(arr[i][j].url, settings.httpRequestTimeout)
                    allRequest.push(axios.get(_url, { timeout: settings.httpRequestTimeout }))
                }
                if (allRequest.length == 0) {
                    continue
                }
                const results = await Promise.allSettled(allRequest);
                results.forEach((result, index) => {
                    let videoInfoMap = videoInfoRef.current
                    let one = nowData[index];
                    if (result.status === 'fulfilled') {
                        const res = result.value;
                        console.log("resp", res);
                        let delay = res.data.delay;
                        let videoInfoMap = videoInfoRef.current
                        videoInfoMap[one.url] = {
                            "video": res.data.video,
                            "audio": res.data.audio,
                            "videoType": ParseM3u.getVideoResolution(res.data.video.width, res.data.video.height),
                            "status": 1,
                            'delay': res.data.delay,
                        }
                        let videoFastNameMap = videoFastNameMapRef.current
                        if (videoFastNameMap[one.sName] === undefined || videoFastNameMap[one.sName] === null) {
                            videoFastNameMap[one.sName] = {
                                index: one.index,
                                delay: delay
                            }
                        } else {
                            if (videoFastNameMap[one.sName].delay >= delay) {
                                videoFastNameMap[one.sName] = {
                                    index: one.index,
                                    delay: delay
                                }
                            }
                        }
                        setShowM3uBodyStatus(one.index, 1, res.data.video, res.data.audio, res.data.delay)
                        setCheckDataStatus(one.index, 1)
                    } else {
                        videoInfoMap[one.url] = {
                            "status": 2,
                        }
                        setShowM3uBodyStatus(one.index, 2, null, null, 0)
                        setCheckDataStatus(one.index, 2)
                    }
                });
                hasCheckedCountRef.current += settings.concurrent
                setHasCheckedCount(hasCheckedCountRef.current)
            }
        }
        return true
    }

    const doNewCheck = async (data, settings, func) => {
        let videoInfoMap = {};
        let videoFastNameMap = {};
        let arr = chunkArray(data, settings.concurrent)
        if (nowMod === 1) {
            console.log("start check")
            for (let i = 0; i < arr.length; i++) {
                let nowData = [];
                let allRequest = [];
                for (let j = 0; j < arr[i].length; j++) {
                    let nowItem = arr[i][j]
                    let getData = findM3uBodyByIndexByOri(deepCopyJson(data), nowItem.index)
                    if (getData.status !== 0) {
                        log("do check status != 0")
                        continue
                    }
                    nowData.push(arr[i][j])
                    allRequest.push(axios.get(arr[i][j].url, { timeout: settings.httpRequestTimeout }))
                }
                if (allRequest.length == 0) {
                    continue
                }
                const results = await Promise.allSettled(allRequest);
                results.forEach((result, index) => {
                    let one = nowData[index];
                    if (result.status === 'fulfilled') {
                        const response = result.value;
                        let delay = -1;
                        videoInfoMap[one.url] = {
                            "video": null,
                            "audio": null,
                            "videoType": null,
                            "status": 1,
                            'delay': delay,
                        }
                        if (videoFastNameMap[one.sName] === undefined || videoFastNameMap[one.sName] === null) {
                            videoFastNameMap[one.sName] = {
                                index: one.index,
                                delay: delay
                            }
                        } else {
                            if (videoFastNameMap[one.sName].delay >= delay) {
                                videoFastNameMap[one.sName] = {
                                    index: one.index,
                                    delay: delay
                                }
                            }
                        }
                        data = setShowM3uBodyStatusByOri(data, one.index, 1, null, null, delay)
                        func(200, one.index)
                    } else {
                        videoInfoMap[one.url] = {
                            "status": 2,
                        }
                        data = setShowM3uBodyStatusByOri(data, one.index, 2, null, null, 0)
                        func(500, one.index)
                    }
                    // hasCheckedCountRef.current += settings.concurrent
                    // setHasCheckedCount(hasCheckedCountRef.current)
                });
            }
            console.log("end check")
        } else {
            console.log("start server check")
            for (let i = 0; i < arr.length; i++) {
                console.log("----now", arr[i])
                let nowData = [];
                let allRequest = [];

                for (let j = 0; j < arr[i].length; j++) {
                    let nowItem = arr[i][j]
                    let getData = findM3uBodyByIndexByOri(data, nowItem.index)
                    if (getData.status !== 0) {
                        log("do check status != 0")
                        continue
                    }
                    nowData.push(arr[i][j])
                    let _url = getCheckUrl(arr[i][j].url, settings.httpRequestTimeout)
                    allRequest.push(axios.get(_url, { timeout: settings.httpRequestTimeout }))
                }
                if (allRequest.length == 0) {
                    continue
                }
                const results = await Promise.allSettled(allRequest);
                results.forEach((result, index) => {
                    let one = nowData[index];
                    if (result.status === 'fulfilled') {
                        const res = result.value;
                        console.log("resp", res);
                        let delay = res.data.delay;
                        videoInfoMap[one.url] = {
                            "video": res.data.video,
                            "audio": res.data.audio,
                            "videoType": ParseM3u.getVideoResolution(res.data.video.width, res.data.video.height),
                            "status": 1,
                            'delay': res.data.delay,
                        }
                        if (videoFastNameMap[one.sName] === undefined || videoFastNameMap[one.sName] === null) {
                            videoFastNameMap[one.sName] = {
                                index: one.index,
                                delay: delay
                            }
                        } else {
                            if (videoFastNameMap[one.sName].delay >= delay) {
                                videoFastNameMap[one.sName] = {
                                    index: one.index,
                                    delay: delay
                                }
                            }
                        }
                        data = setShowM3uBodyStatusByOri(data, one.index, 1, res.data.video, res.data.audio, res.data.delay)
                        func(200, one.index)
                    } else {
                        videoInfoMap[one.url] = {
                            "status": 2,
                        }
                        data = setShowM3uBodyStatusByOri(data, one.index, 2, null, null, 0)
                        func(500, one.index)
                    }
                });
                // hasCheckedCountRef.current += settings.concurrent
                // setHasCheckedCount(hasCheckedCountRef.current)
            }
        }
        return data
    }

    const setCheckDataIsFinished = () => {
        log("check finished.....")
        log("showM3uBody", showM3uBody)
        log("videoInfoRef.current", videoInfoRef.current)
        if (nowCheckUrlModRef.current === 1) {
            setHandleMod(2)
            setCheckUrlMod(0)
            nowCheckUrlModRef.current = 0
        }
    }

    const onCheckTheseLinkIsAvailable = async () => {
        if (handleMod === 1) {
            return
        }
        setCheckUrlMod(1)
        nowCheckUrlModRef.current = 1
        setHandleMod(1)
        let data = prepareCheckData()
        let _ = await doCheck(data)
        setCheckDataIsFinished()
    }

    const doFastCheck = async (data, settings, totalFunc, func) => {
        let copyData = deepCopyJson(data)
        let m3uData = ParseM3u.parseOriginalBodyToList(copyData)
        totalFunc(m3uData.length)
        return await doNewCheck(m3uData, settings, func)
    }

    const onChangeExportData = (value) => {
        setExportData(value)
    }

    const onChangeExportStr = () => {
        setExportDataStr(_toOriginalStr(exportData))
    }

    const batchChangeGroupName = (selectArr, groupName) => {
        updateDataByIndex(selectArr, { "groupTitle": groupName })
    }

    const addGroupName = (name) => {
        addGroup(name)
    }

    const updateDataByIndex = (indexArr, mapData) => {
        let row = deepCopyJson(showM3uBody)
        if (mapData["groupTitle"] !== undefined && mapData["groupTitle"] !== null) {
            addGroup(mapData["groupTitle"])
        }
        for (let i = 0; i < row.length; i++) {
            if (inArray(indexArr, row[i].index)) {
                for (let j in mapData) {
                    if (j === 'name') {
                        row[i]['sName'] = mapData[j]
                    }
                    row[i][j] = mapData[j]
                }
            }
        }
        let data = ParseM3u.parseOriginalBodyToList(originalM3uBody)
        for (let i = 0; i < data.length; i++) {
            if (inArray(indexArr, data[i].index)) {
                for (let j in mapData) {
                    if (j === 'name') {
                        data[i]['sName'] = mapData[j].toLowerCase()
                    }
                    data[i][j] = mapData[j]
                }
            }
        }
        setOriginalM3uBody(_toOriginalStr(data))
        setShowM3uBody(row)
    }

    const _toOriginalStr = (data) => {
        let body = `#EXTM3U\n`;
        for (let i = 0; i < data.length; i += 1) {
            body += `#EXTINF:-1 tvg-id="${data[i].tvgId}" tvg-logo="${data[i].tvgLogo}" group-title="${data[i].groupTitle}",${data[i].name}\n${data[i].url}\n`
        }
        return body
    }

    const pauseCheckUrlData = () => {
        setCheckUrlMod(2)
        nowCheckUrlModRef.current = 2
    }

    const resumeCheckUrlData = async () => {
        setCheckUrlMod(1)
        nowCheckUrlModRef.current = 1
        await doCheck(checkData)
        setCheckDataIsFinished()
    }

    return (
        <MainContext.Provider value={{
            originalM3uBody, changeOriginalM3uBody,
            exportDataStr, setExportDataStr,
            exportData, onChangeExportData,
            uGroups, setUGroups,
            videoResolution, changeVideoResolution,
            settings, onChangeSettings,
            showM3uBody, handleMod, hasCheckedCount,
            headerHeight, checkUrlMod,
            onCheckTheseLinkIsAvailable, filterM3u,
            deleteShowM3uRow, onExportValidM3uData,
            onSelectedRow, onSelectedOrNotAll, getAvailableOrNotAvailableIndex,
            changeDialogBodyData,
            changeOriginalM3uBodies, updateDataByIndex,
            onChangeExportStr, batchChangeGroupName, addGroupName, getCheckUrl,
            pauseCheckUrlData, resumeCheckUrlData, strToCsv, clearDetailData,
            getM3uBody,
            needFastSource, onChangeNeedFastSource, nowMod, getBodyType,
            nowLanguage, changeLanguage, languageList, nowWindow, clientSaveFile,
            nowPlatform, videoPlayTypes, initControlBar, showWindowsTopBar,
            doFastCheck,
            subCheckMenuList
        }}>
            {children}
        </MainContext.Provider>
    )
}