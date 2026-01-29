import * as React from 'react';
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    Button,
    TextField,
    Tabs,
    Tab,
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@mui/material';
import { MainContext } from '../../context/main';

export const DownloadDialog = ({ onClose, formValue, open }) => {
    const { t } = useTranslation();
    const [showData, setShowData] = useState([]);
    const [localLogoData, setLocalLogoData] = useState('');
    const [url, setUrl] = useState('');
    const [withLocalLogoUrl, setWithLocalLogoUrl] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [hasLogoType, setHasLogoType] = useState(false);
    const _mainContext = useContext(MainContext);
    const [fileType, setFileType] = useState(0);//默认是0 m3u 1 txt
    const [fileTypeList, setFileTypeList] = useState([{label: 'm3u', value: 0}, {label: 'txt', value: 1}]);
    const [checkResultMap, setCheckResultMap] = useState({});

    useEffect(() => {
        if (!open) return; // 对话框未打开时不执行
        
        setCurrentTab(0);
        
        // 重置数据
        setShowData('');
        setLocalLogoData('');
        setUrl('');
        setWithLocalLogoUrl('');
        setHasLogoType(false);
        
        // 解析 check_result 字段
        const parseCheckResult = () => {
            if (!formValue.check_result || !Array.isArray(formValue.check_result)) {
                // 如果没有 check_result，尝试使用原有的 content 和 url（向后兼容）
                if (formValue.content !== '') {
                    setShowData(formValue.content);
                }
                if (formValue.url) {
                    setUrl(window.document.location.origin + "/" + formValue.url);
                    setWithLocalLogoUrl(window.document.location.origin + "/q?url=/" + formValue.url);
                }
                setCheckResultMap({});
                return;
            }
            
            const nextMap = {};
            // 遍历 check_result 数组
            formValue.check_result.forEach(item => {
                const typeKey = item.type || 'sub';
                if (!nextMap[typeKey]) {
                    nextMap[typeKey] = {};
                }
                if (item.content) {
                    nextMap[typeKey].content = item.content;
                }
                if (item.url) {
                    nextMap[typeKey].url = item.url;
                }
                // 向后兼容：保持原有状态
                if (typeKey === 'sub') {
                    if (item.content) {
                        setShowData(item.content);
                    }
                    if (item.url) {
                        setUrl(item.url);
                    }
                }
            });
            setCheckResultMap(nextMap);
        };
        
        parseCheckResult();
    }, [formValue, open]);


    const downloadFile = async () => {
        _mainContext.saveFile();
        if (_mainContext.nowMod === 0) {
            // 根据当前 tab 打开对应的链接
            const downloadUrl = currentUrl;
            window.open(downloadUrl);
        } else {
            // 根据当前 tab 下载对应的内容
            const content = currentContent;
            _mainContext.clientSaveFile(content, 'm3u');
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };
    const buildSubUrl = (rawUrl) => {
        if (!rawUrl) return '';
        return rawUrl.startsWith('http')
            ? rawUrl
            : `${window.document.location.origin}/${rawUrl}&r=${fileType}`;
    };

    const currentType = currentTab === 0 ? 'sub' : (currentTab === 1 ? 'ipv4' : 'ipv6');
    const currentData = checkResultMap[currentType] || {};
    const currentContent = currentData.content || '';
    const currentUrl = buildSubUrl(currentData.url || url);

    return (
        <Dialog onClose={() => onClose(false)} open={open} maxWidth="lg" fullWidth>
            <Box sx={{ width: '100%', minHeight: '400px' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>{t('文件类型')}</InputLabel>
                            <Select
                                value={fileType}
                                label={t('文件类型')}
                                onChange={(event) => setFileType(event.target.value)}
                            >
                                {fileTypeList.map(item => (
                                    <MenuItem key={item.value} value={item.value}>
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div>{t('订阅链接')}：<b>{currentUrl}</b></div>
                    </Box>
                </Box>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange}>
                        <Tab label={t('原始数据')} />
                        <Tab label={t('ipv4')} />
                        <Tab label={t('ipv6')} />
                    </Tabs>
                </Box>

                <Box sx={{ p: 2 }}>
                   
                        <>
                            {currentContent !='' ? (
                                <TextField
                                    multiline
                                    fullWidth
                                    minRows={15}
                                    maxRows={25}
                                    value={currentContent}
                                    variant="outlined"
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            ) : (
                                <Box sx={{ padding: "60px 0", textAlign: 'center' }}>
                                    <div>{t('暂未生成')}</div>
                                </Box>
                            )}
                        </>

        
                </Box>
            </Box>
        </Dialog>
    );
}; 