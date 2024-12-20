import * as React from 'react';
import { useState, useContext, useEffect } from 'react'
import { MainContext } from '../../context/main';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
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

export default function Fast() {

    const { t } = useTranslation();
    const _mainContext = useContext(MainContext);
    const [loading, setLoading] = useState(false);
    const [selectFileNames, setSelectFileNames] = useState([]);//上传的文件
    const [sort, setSort] = useState(true);//是否需要排序
    const [concurrent, setConcurrent] = useState(10);// 并发数
    const [nowStatus, setNowStatus] = useState(0)// 0未检查 1检查中 2已结束
    const [total, setTotal] = useState(0)
    const [checkCount, setCheckCount] = useState(0)
    const [successCount, setSuccessCount] = useState(0)
    const [failedCount, setFailedCount] = useState(0)
    const [urls, setUrls] = useState([])
    const [needCheck, setNeedCheck] = useState(true)
    const [oneUri, setOneUri] = useState('')
    const [selectedType, setSelectedType] = useState(0)// 选择类型 0本地 1网络

    const handleConfirm = async () => {
        console.log(_mainContext.checkHistory)
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
    }

    const handleFileUpload = (e) => {
        let rows = []
        for (let i = 0; i < e.target.files.length; i++) {
            rows.push(e.target.files[i])
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

    return (
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
                                                        <Input
                                                            disabled
                                                            value={value.name}
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
                                                    <FormControl fullWidth style={{ width: '400px' }} key={"urls" + index}>
                                                        <Input
                                                            disabled
                                                            value={value}
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
                            onClick={handleConfirm}
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
    )
}