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

    useEffect(() => {

    }, [])

    const handleConfirm = async () => {
        setNowStatus(1)
        let i = 0
        let s = 0
        let f = 0
        let data = await _mainContext.getBodyType(`#EXTM3U
#EXTINF:-1 tvg-id="CCTV1" tvg-name="CCTV1" tvg-logo="https://live.fanmingming.com/tv/CCTV1.png" group-title="央视",CCTV-1
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News.m3u8
#EXTINF:-1 tvg-id="CCTV21" tvg-name="CCTV21" tvg-logo="https://live.fanmingming.com/tv/CCTV21.png" group-title="央视",CCTV-21
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News.m3u8
#EXTINF:-1 tvg-id="CCTV2" tvg-name="CCTV2" tvg-logo="https://live.fanmingming.com/tv/CCTV2.png" group-title="央视",CCTV-2
https://cdn4.skygo.mn/live/disk1/BBC_News/HLSv3-FTA/BBC_News.m3u8`)
        let resultData = await _mainContext.doFastCheck(data, {
            'concurrent': concurrent,
        }, function (total) {
            setTotal(total);
        }, function (code, index) {
            i++
            if (code === 200) {
                s++
            } else {
                f++
            }
            setCheckCount(i)
            setFailedCount(f)
            setSuccessCount(s)
            if (i === total) {
                setNowStatus(2)
            }
        })
        console.log(resultData)
    }

    const handleFileUpload = (e) => {
        let rows = []
        for (let i = 0; i < e.target.files.length; i++) {
            rows.push(e.target.files[i])
        }
        setSelectFileNames(rows)
    }

    return (
        <Box style={{
            padding: '0 20px',
        }}>
            <Box style={{ width: '700px' }}>
                {
                    nowStatus !== 0 ? (
                        <Box>
                            <div>总：{total}</div>
                            <div>正在检查: 成功{successCount}/ 失败{failedCount}</div>
                        </Box>
                    ) : ''
                }
                <FormControl>
                    <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                        {t('请选择检测文件')}
                        <input hidden accept=".m3u,.txt" multiple type="file" onChange={handleFileUpload} />
                    </Button>
                    <span>(仅支持<b>.m3u</b>以及<b>.txt</b>文件格式)</span>
                    {
                        selectFileNames.map((value, index) => (
                            <div key={index}>{value.name}</div>
                        ))
                    }
                </FormControl>
                <FormControl fullWidth style={{
                    margin: "20px 0 20px",
                }}>
                    <FormLabel id="demo-row-radio-buttons-group-label">{t('是否需要排序')}</FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={sort}
                    // onChange={handleChangeSortValue}
                    >
                        <FormControlLabel value="false" control={<Radio />} label={t('否')} />
                        <FormControlLabel value="true" control={<Radio />} label={t('是')} />
                    </RadioGroup>
                </FormControl>
                <FormControl fullWidth style={{
                    margin: "20px 0 20px",
                    maxWidth: '150px'
                }}>
                    <FormLabel id="demo-row-radio-buttons-group-label">{t('调整并发数')}</FormLabel>
                    <TextField type="number" id="standard-basic" value={concurrent} variant="standard" />
                </FormControl>
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
        </Box>
    )
}