import { useState, useContext, useEffect } from 'react'
import * as React from 'react';
import { MainContext } from './../../context/main';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import FormLabel from '@mui/material/FormLabel';
import Dialog from '@mui/material/Dialog';
import _package from './../../../package';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import { useTranslation, initReactI18next } from "react-i18next";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { fontSize, fontWeight } from '@mui/system';
import { ApiTaskService } from '../../services/apiTaskService';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CircularProgress from '@mui/material/CircularProgress';

function AddSourceDialog(props) {
    const { t } = useTranslation();
    const { onClose, open, saveData } = props;

    const [body, setBody] = useState('')

    const handleClose = () => {
        onClose(false);
    };

    const onChangeBody = (e) => {
        setBody(e.target.value)
    }

    const doSave = () => {
        saveData(body)
    }

    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>{t('自定义网络源')}</DialogTitle>
            <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <FormControl style={{ width: '550px' }}>
                    <TextField
                        id="demo-simple-select-standard"
                        value={body}
                        multiline
                        rows={10}
                        onChange={onChangeBody}
                    />
                </FormControl>
                <FormControl style={{ margin: '10px 0' }}>
                    <LoadingButton
                        onClick={doSave}
                        variant="outlined"
                    >
                        {t('保存')}
                    </LoadingButton>
                </FormControl>
                <Box>{t('格式：名称,https://xxxx.m3u + 换行，其中名称需要唯一，如下所示')}</Box>
                <Box>star movies,http://srtarmovies.m3u8</Box>
                <Box>star plus,https://plus.m3u</Box>
            </div>
        </Dialog>
    );
}

export default function Settings() {
    const _mainContext = useContext(MainContext);
    const [showAddSourceDialog, setShowAddSourceDialog] = useState(false)
    const [httpRequestTimeout, setHttpRequestTimeout] = useState(8000);
    const [concurrent, setConcurrent] = useState(1);
    const [language, setLanguage] = useState('zh');
    const [customLink, setCustomLink] = useState([]);
    const [privateHost, setPrivateHost] = useState('')
    const [dialogMsg, setDialogMsg] = useState('');
    const [playerSource, setPlayerSource] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [newVersion, setNewVersion] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [taskService] = useState(() => new ApiTaskService());
    const { t } = useTranslation();

    useEffect(() => {
        let config = _mainContext.settings
        _mainContext.check_version()
        if(_mainContext.nowMod === 1) {
            setNewVersion(_mainContext.configInfo.app_version)
        } else {
            setNewVersion(_mainContext.configInfo.version)
        }
        if (config !== null) {
            setHttpRequestTimeout(config.httpRequestTimeout ?? 1000)
            setCustomLink(config.customLink ?? [])
            setConcurrent(config.concurrent ?? 1)
            setLanguage(config.language ?? 'zh')
            setPrivateHost(config.privateHost ?? '')
            setPlayerSource(config.playerSource ?? 'video/mp2t')
        }
    }, [_mainContext])

    const handleChangeConfigSettings = (e) => {
        const { name, value } = e.target;
        let valueInt = parseInt(e.target.value, 10)
        if (name === 'httpRequestTimeout') {
            setHttpRequestTimeout(valueInt)
        } else if (name === 'concurrent') {
            if (valueInt === 0) {
                valueInt = 1
            }
            setConcurrent(valueInt)
        } else if (name === 'language') {
            setLanguage(e.target.value)
        } else if (name === 'privateHost') {
            setPrivateHost(e.target.value)
        } else if (name === 'playerSource') {
            setPlayerSource(e.target.value)
        }
    }

    const doSaveConfigSettings = () => {
        _mainContext.onChangeSettings({
            httpRequestTimeout: httpRequestTimeout,
            customLink: customLink,
            concurrent: concurrent,
            language: language,
            privateHost: privateHost,
            playerSource: playerSource,
        })
        _mainContext.changeLanguage(language)
        setOpenDialog(true)
        setDialogMsg(t('保存成功'))
    }

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const res = await taskService.exportConfig();
            if (res && res.file) {
                // 如果是相对路径，可能需要拼接 host
                const downloadUrl = res.file.startsWith('http') ? res.file : `${_mainContext.settings.privateHost || ''}${res.file}`;
                window.open(downloadUrl);
                setDialogMsg(t('导出成功'));
            } else {
                setDialogMsg(t('导出失败：接口未返回文件地址'));
            }
        } catch (error) {
            console.error('Export failed:', error);
            setDialogMsg(t('导出失败'));
        } finally {
            setIsExporting(false);
            setOpenDialog(true);
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await taskService.importConfig(formData);
            setDialogMsg(t('导入成功，请重启应用或刷新页面'));
        } catch (error) {
            console.error('Import failed:', error);
            setDialogMsg(t('导入失败'));
        } finally {
            setIsImporting(false);
            setOpenDialog(true);
            e.target.value = ''; // clear input
        }
    };

    const handleShowAddSourceDialog = (val) => {
        setShowAddSourceDialog(val)
    }

    const saveSource = (val) => {
        let oriArr = customLink
        let arr = val.split('\n')
        if (arr.length > 0) {
            for (let i = 0; i < arr.length; i++) {
                let one = arr[i].split(',')
                oriArr.push({
                    name: one[0],
                    url: one[1],
                })
            }
            setCustomLink(oriArr)
        }
        setShowAddSourceDialog(false)
    }

    const nowVersion = _package.version;

    const delCustomLink = (i) => {
        setCustomLink(customLink.filter((url, index) => index !== i))
    }

    const handleCloseDialogMsg = () => {
        setOpenDialog(false)
        setDialogMsg('')
    }

    return (
        <Box style={{
            padding: '0 20px'
        }}>
            <AddSourceDialog
                open={showAddSourceDialog}
                onClose={() => handleShowAddSourceDialog(false)}
                saveData={saveSource}
            />
            <Snackbar
                open={openDialog}
                autoHideDuration={3000}
                message={dialogMsg}
                onClose={handleCloseDialogMsg}
            />
            <Box>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    width: '400px'
                }}>
                    <FormControl sx={{ marginBottom: '20px' }}>
                        <InputLabel id="demo-row-radio-buttons-group-label">{t('语言')}</InputLabel>
                        <Select
                            name="language"
                            value={language}
                            label={t('语言')}
                            onChange={handleChangeConfigSettings}
                        >
                            {
                                _mainContext.languageList.map((val, index) => (
                                    <MenuItem key={index} value={val.code}>{val.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                    {/* <FormControl sx={{ marginBottom: '20px' }}>
                        <InputLabel id="demo-row-radio-buttons-group-label">{t('播放平台')}</InputLabel>
                        <Select
                            name="playerSource"
                            value={playerSource}
                            label={t('播放平台')}
                            onChange={handleChangeConfigSettings}
                        >
                            {
                                _mainContext.videoPlayTypes.map((val, index) => (
                                    <MenuItem key={index} value={val.value}>{val.name}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl> */}
                    <LoadingButton
                        onClick={doSaveConfigSettings}
                        variant="outlined"
                    >
                        {t('保存')}
                    </LoadingButton>

                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {t('数据备份与恢复')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <LoadingButton
                            variant="outlined"
                            loading={isExporting}
                            startIcon={<FileDownloadIcon />}
                            onClick={handleExport}
                        >
                            {t('导出配置')}
                        </LoadingButton>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={isImporting ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                            disabled={isImporting}
                        >
                            {isImporting ? t('正在导入...') : t('导入配置')}
                            <input
                                type="file"
                                hidden
                                accept=".zip"
                                onChange={handleImport}
                            />
                        </Button>
                    </Box>
                </Box>
                <FormControl sx={{ marginTop: '20px' }}>
                    <Box>{t('当前版本')}: {nowVersion}</Box>
                    {
                        _mainContext.showNewVersion ? (
                            <Box style={{ color: 'green', fontWeight:"bold" }}>{t('有新版本')}: {newVersion}</Box>
                        ) : ''
                    }
                </FormControl>
            </Box>
        </Box>
    )
}