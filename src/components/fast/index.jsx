import * as React from 'react';
import { useState, useContext, useEffect, useRef } from 'react'
import { MainContext } from '../../context/main';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LoadingButton from '@mui/lab/LoadingButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import UploadIcon from '@mui/icons-material/Upload';
import { useNavigate } from 'react-router-dom';
import { useTranslation, initReactI18next } from "react-i18next";
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import Input from '@mui/material/Input';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CountryJson from './../../assets/api/country.json'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


export default function Fast() {

    const [open, setOpen] = useState(false);
    const [scroll, setScroll] = useState('paper');

    const { t } = useTranslation();
    const navigate = useNavigate();
    const _mainContext = useContext(MainContext);
    const [loading, setLoading] = useState(false);
    const [selectFileNames, setSelectFileNames] = useState([]);//上传的文件
    const [sort, setSort] = useState(true);//是否需要排序
    const [nowStatus, setNowStatus] = useState(0)// 0未检查 1检查中 2已结束
    const [total, setTotal] = useState(0)
    const [checkCount, setCheckCount] = useState(0)
    const [successCount, setSuccessCount] = useState(0)
    const [failedCount, setFailedCount] = useState(0)
    const [urls, setUrls] = useState([{
        "url": "http://localhost", "status": 200, "body": `#EXTM3U
#EXTINF:-1 tvg-id="CCTV1" tvg-name="CCTV1" tvg-logo="https://live.fanmingming.com/tv/CCTV1.png" group-title="央视",CCTV-1
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News1.m3u8
#EXTINF:-1 tvg-id="CCTV21" tvg-name="CCTV21" tvg-logo="https://live.fanmingming.com/tv/CCTV21.png" group-title="央视",CCTV-21
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News2.m3u8
#EXTINF:-1 tvg-id="CCTV2" tvg-name="CCTV2" tvg-logo="https://live.fanmingming.com/tv/CCTV2.png" group-title="央视",CCTV-2
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News3.m3u8
#EXTINF:-1 tvg-id="CCTV1" tvg-name="CCTV1" tvg-logo="https://live.fanmingming.com/tv/CCTV1.png" group-title="央视",CCTV-1
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News1.m3u8
#EXTINF:-1 tvg-id="CCTV21" tvg-name="CCTV21" tvg-logo="https://live.fanmingming.com/tv/CCTV21.png" group-title="央视",CCTV-21
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News2.m3u8
#EXTINF:-1 tvg-id="CCTV2" tvg-name="CCTV2" tvg-logo="https://live.fanmingming.com/tv/CCTV2.png" group-title="央视",CCTV-2
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News3.m3u8
#EXTINF:-1 tvg-id="CCTV1" tvg-name="CCTV1" tvg-logo="https://live.fanmingming.com/tv/CCTV1.png" group-title="央视",CCTV-1
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News1.m3u8
#EXTINF:-1 tvg-id="CCTV21" tvg-name="CCTV21" tvg-logo="https://live.fanmingming.com/tv/CCTV21.png" group-title="央视",CCTV-21
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News2.m3u8
#EXTINF:-1 tvg-id="CCTV2" tvg-name="CCTV2" tvg-logo="https://live.fanmingming.com/tv/CCTV2.png" group-title="央视",CCTV-2
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News3.m3u8` }, { "url": "http://localhost", "status": 500, "body": `<html>code:500</html>` }])
    const [needCheck, setNeedCheck] = useState(true)
    const [oneUri, setOneUri] = useState('')
    const [selectedType, setSelectedType] = useState(0)// 选择类型 0本地 1网络
    const [checkData, setCheckData] = useState([])
    const [showBody, setShowBody] = useState('')

    const handleConfirm = async () => {
        let checkOriData = [];
        if (selectedType === 0) {
            checkOriData = selectFileNames
        } else {
            checkOriData = urls
        }
        if (checkOriData.length === 0) {
            return
        }
        if (selectedType === 1) {
            _mainContext.saveDataToHistory(urls)
        }
        setNowStatus(1)
        let i = 0
        let s = 0
        let f = 0
        let totalData = 0
        let data = await _mainContext.getBodyType(`#EXTM3U
#EXTINF:-1 tvg-id="CCTV1" tvg-name="CCTV1" tvg-logo="https://live.fanmingming.com/tv/CCTV1.png" group-title="央视",CCTV-1
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News1.m3u8
#EXTINF:-1 tvg-id="CCTV21" tvg-name="CCTV21" tvg-logo="https://live.fanmingming.com/tv/CCTV21.png" group-title="央视",CCTV-21
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News2.m3u8
#EXTINF:-1 tvg-id="CCTV2" tvg-name="CCTV2" tvg-logo="https://live.fanmingming.com/tv/CCTV2.png" group-title="央视",CCTV-2
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News3.m3u8
#EXTINF:-1 tvg-id="CCTV1" tvg-name="CCTV1" tvg-logo="https://live.fanmingming.com/tv/CCTV1.png" group-title="央视",CCTV-1
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News1.m3u8
#EXTINF:-1 tvg-id="CCTV21" tvg-name="CCTV21" tvg-logo="https://live.fanmingming.com/tv/CCTV21.png" group-title="央视",CCTV-21
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News2.m3u8
#EXTINF:-1 tvg-id="CCTV2" tvg-name="CCTV2" tvg-logo="https://live.fanmingming.com/tv/CCTV2.png" group-title="央视",CCTV-2
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News3.m3u8
#EXTINF:-1 tvg-id="CCTV1" tvg-name="CCTV1" tvg-logo="https://live.fanmingming.com/tv/CCTV1.png" group-title="央视",CCTV-1
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News1.m3u8
#EXTINF:-1 tvg-id="CCTV21" tvg-name="CCTV21" tvg-logo="https://live.fanmingming.com/tv/CCTV21.png" group-title="央视",CCTV-21
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News2.m3u8
#EXTINF:-1 tvg-id="CCTV2" tvg-name="CCTV2" tvg-logo="https://live.fanmingming.com/tv/CCTV2.png" group-title="央视",CCTV-2
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News3.m3u8`)
        let resultData = await _mainContext.doFastCheck(data, _mainContext.settings, function (total) {
            setTotal(total);
            totalData = total;
        }, function (code, index) {
            console.log(total)
            i++
            if (code === 200) {
                s++
            } else {
                f++
            }
            setCheckCount(i)
            setFailedCount(f)
            setSuccessCount(s)
            if (i === totalData) {
                setNowStatus(2)
            }
        })
        setCheckData(resultData)
    }

    const handleDetail = () => {
        let data = [];
        if (selectedType === 0) {
            data = selectFileNames
        } else {
            data = urls
        }
        let md5Str = _mainContext.addDetail(checkData, data, selectedType === 0, needCheck ? 1 : 0, sort ? 1 : 0)
        navigate("/detail?md5=" + md5Str)
    }

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            // 文件读取成功时的回调
            reader.onload = () => {
                resolve(reader.result); // 返回文件内容
            };

            // 文件读取出错时的回调
            reader.onerror = () => {
                reject(reader.error); // 返回错误信息
            };

            // 根据需要的读取方法启动 FileReader
            reader.readAsText(file); // 读取文件为文本
        });
    }

    const handleFileUpload = async (e) => {
        let rows = []
        for (let i = 0; i < e.target.files.length; i++) {
            let body = await readFileContent(e.target.files[i])
            console.log(body)
            rows.push({
                "body": body,
                "url": e.target.files[i].name,
                "status": 200,
            })
        }
        setSelectFileNames(rows)
    }

    const handleSelectedType = (e) => {
        setSelectedType(parseInt(e.target.value, 10));
    }

    const handleClickUriDelete = (i) => {
        let kw = [...urls]
        kw.splice(i, 1)
        setUrls(kw);
    }

    const handleClickFilesDelete = (i) => {
        let kw = [...selectFileNames]
        kw.splice(i, 1)
        setSelectFileNames(kw);
    }

    const handleChangeSortValue = (e) => {
        setSort(e.target.value)
    }

    const handleChangeNeedCheck = (e) => {
        setNeedCheck(e.target.value)
    }

    const handleClickUriAdd = (e) => {
        const newUrls = [...urls]; // 创建urls数组的副本
        newUrls.push(oneUri); // 在指定索引处设置新的值
        setUrls(newUrls)
        setOneUri("")
    }

    const changeOneUri = (e) => {
        setOneUri(e.target.value)
    }

    const getFileNameAndExtension = (url) => {
        try {
            // 创建一个 URL 对象
            const urlObj = new URL(url);
            // 获取路径名
            const pathname = urlObj.pathname;
            // 获取文件名（带后缀）
            const fileNameWithExtension = pathname.substring(pathname.lastIndexOf('/') + 1);
            // 获取文件名（不带后缀）
            const fileName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf('.'));
            // 获取文件后缀
            const fileExtension = fileNameWithExtension.substring(fileNameWithExtension.lastIndexOf('.') + 1);
            return fileName + "." + fileExtension
        } catch (e) {
            return ""
        }
    }

    const fillThisData = (e) => {
        setUrls(e.urls)
        setNeedCheck(e.needCheck ?? true)
        setSelectedType(1)
        setNowStatus(0)
        setSort(e.needSort ?? false)
    }

    const handleClickOpen = (body) => () => {
        setOpen(true);
        setScroll('paper');
        setShowBody(body)
    };

    const handleClose = () => {
        setOpen(false);
    };

    const descriptionElementRef = useRef(null);

    useEffect(() => {
        if (open) {
            const { current: descriptionElement } = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [open]);

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                scroll={scroll}
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogContent dividers={scroll === 'paper'}>
                    <DialogContentText
                        id="scroll-dialog-description"
                        ref={descriptionElementRef}
                        tabIndex={-1}
                    >
                        <TextField
                            id="standard-multiline-static"
                            multiline
                            rows={10}
                            value={showBody}
                            variant="standard"
                            style={{ width: '800px' }}
                        />
                    </DialogContentText>
                </DialogContent>
            </Dialog>
            <Box style={{
                padding: '0 20px',
            }}>
                <Box style={{ width: '700px' }}>
                    {
                        nowStatus >= 1 ? (
                            <Box>
                                <div>总：{total}</div>
                                <div>正在检查: 成功{successCount}/ 失败{failedCount}</div>
                            </Box>
                        ) : ''
                    }
                    {
                        nowStatus === 0 ? (
                            <>
                                <FormControl fullWidth>
                                    <FormLabel id="demo-controlled-radio-buttons-group">检测类型</FormLabel>
                                    <RadioGroup
                                        aria-labelledby="demo-controlled-radio-buttons-group"
                                        name="controlled-radio-buttons-group"
                                        value={selectedType}
                                        row
                                        onChange={handleSelectedType}
                                    >
                                        <FormControlLabel value={0} control={<Radio />} label="本地" />
                                        <FormControlLabel value={1} control={<Radio />} label="网络" />
                                    </RadioGroup>
                                </FormControl>
                                {
                                    selectedType === 0 ? (
                                        <>
                                            <FormControl fullWidth style={{ width: '400px' }}>
                                                <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                                                    {t('请选择检测文件')}
                                                    <input hidden accept=".m3u,.txt" multiple type="file" onChange={handleFileUpload} />
                                                </Button>
                                                <span>(仅支持<b>.m3u</b>以及<b>.txt</b>文件格式)</span>
                                            </FormControl>
                                            <div>
                                                {
                                                    selectFileNames.map((value, index) => (
                                                        <FormControl fullWidth style={{ width: '400px' }} key={"files" + index}>
                                                            <div style={{ display: 'flex', width: '600px' }}>
                                                                <Input
                                                                    disabled
                                                                    style={{ width: '400px' }}
                                                                    value={value.url}
                                                                    endAdornment={
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                onClick={() => handleClickFilesDelete(index)}
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    }
                                                                />
                                                                {
                                                                    value.status === 200 ? (
                                                                        <IconButton aria-label="delete" onClick={handleClickOpen(value.body)} color="primary">
                                                                            <CheckCircleIcon />
                                                                        </IconButton>
                                                                    ) : ''
                                                                }
                                                            </div>
                                                        </FormControl>
                                                    ))
                                                }
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <FormControl fullWidth style={{ width: '400px' }}>
                                                <Input
                                                    value={oneUri}
                                                    key={10000000000}
                                                    id="standard-adornment-input"
                                                    onChange={changeOneUri}
                                                    placeholder='请输入链接,仅支持.m3u以及.txt后缀链接'
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <IconButton
                                                                onClick={handleClickUriAdd}
                                                            >
                                                                <AddCircleOutlineIcon />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    }
                                                />
                                            </FormControl>
                                            <div style={{ marginTop: '20px' }}>
                                                {
                                                    urls.map((value, index) => (
                                                        <FormControl fullWidth key={"urls" + index}>
                                                            <div style={{ display: 'flex', width: '600px' }}>
                                                                <Input
                                                                    disabled
                                                                    value={value.url}
                                                                    style={{ width: '400px' }}
                                                                    endAdornment={
                                                                        <InputAdornment position="end">
                                                                            <IconButton
                                                                                onClick={() => handleClickUriDelete(index)}
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </InputAdornment>
                                                                    }
                                                                />
                                                                {
                                                                    value.status === 200 ? (
                                                                        <IconButton aria-label="delete" onClick={handleClickOpen(value.body)} color="primary">
                                                                            <CheckCircleIcon />
                                                                        </IconButton>
                                                                    ) : ''
                                                                }
                                                                {
                                                                    value.status === 500 ? (
                                                                        <IconButton aria-label="delete" onClick={handleClickOpen(value.body)} color="error">
                                                                            <ErrorIcon />
                                                                        </IconButton>
                                                                    ) : ''
                                                                }
                                                            </div>
                                                        </FormControl>
                                                    ))
                                                }
                                            </div>
                                        </>
                                    )
                                }
                                {
                                    selectedType === 1 ? (
                                        <FormControl fullWidth style={{
                                            margin: "10px 0 10px",
                                        }}>
                                            <FormLabel id="demo-row-radio-buttons-group-label">{t('是否需要检查')}</FormLabel>
                                            <RadioGroup
                                                row
                                                aria-labelledby="demo-row-radio-buttons-group-label"
                                                name="row-radio-buttons-group"
                                                value={needCheck}
                                                onChange={handleChangeNeedCheck}
                                            >
                                                <FormControlLabel value="false" control={<Radio />} label={t('否')} />
                                                <FormControlLabel value="true" control={<Radio />} label={t('是')} />
                                            </RadioGroup>
                                        </FormControl>
                                    ) : ''
                                }
                                <FormControl fullWidth style={{
                                    margin: "10px 0 10px",
                                }}>
                                    <FormLabel id="demo-row-radio-buttons-group-label">{t('是否需要排序')}</FormLabel>
                                    <RadioGroup
                                        row
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        name="row-radio-buttons-group"
                                        value={sort}
                                        onChange={handleChangeSortValue}
                                    >
                                        <FormControlLabel value="false" control={<Radio />} label={t('否')} />
                                        <FormControlLabel value="true" control={<Radio />} label={t('是')} />
                                    </RadioGroup>
                                </FormControl>
                            </>
                        ) : ''
                    }
                    <Box sx={{
                        display: 'flex',
                        marginTop: '5px'
                    }}>
                        {
                            nowStatus === 0 ? (<LoadingButton
                                size="small"
                                onClick={handleConfirm}
                                loading={loading}
                                variant="contained"
                                startIcon={<NavigateNextIcon />}
                            >
                                {t('开始检测')}
                            </LoadingButton>) : ''
                        }
                        {
                            nowStatus === 2 ? (<LoadingButton
                                size="small"
                                onClick={handleDetail}
                                loading={loading}
                                variant="contained"
                                startIcon={<NavigateNextIcon />}
                            >
                                {t('去编辑')}
                            </LoadingButton>) : ''
                        }
                    </Box>
                </Box>
                {
                    _mainContext.checkHistory.length > 0 ? (
                        <Box style={{ margin: '30px 0 20px 0' }}>
                            检测历史：
                            <Box style={{ display: 'flex' }}>
                                {
                                    _mainContext.checkHistory.map((value, index) => (
                                        <Card sx={{ width: 200, marginRight: 2 }} key={index}>
                                            <CardContent>
                                                {
                                                    value.urls.map((uv, ui) => (
                                                        <Typography key={ui}>{getFileNameAndExtension(uv)}</Typography>
                                                    ))
                                                }
                                            </CardContent>
                                            <CardActions>
                                                <Button size="small" onClick={() => fillThisData(value)}>再次检测</Button>
                                            </CardActions>
                                        </Card>
                                    ))
                                }
                            </Box>
                        </Box>
                    ) : ''
                }
                <Box style={{ margin: '10px 0 20px 0' }}>
                    公共源+自定义网络源：
                    <Box style={{ display: 'flex' }}>
                        {
                            CountryJson.map((value, index) => (
                                <Card sx={{ width: 200, marginRight: 2 }} key={index}>
                                    <CardContent>
                                        {
                                            value.url.map((uv, ui) => (
                                                <Typography key={ui}>{getFileNameAndExtension(uv)}</Typography>
                                            ))
                                        }
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" onClick={() => fillThisData({ "urls": value.url })}>检测</Button>
                                    </CardActions>
                                </Card>
                            ))
                        }
                    </Box>
                </Box>
            </Box>
        </>
    )
}