import * as React from 'react';
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    Button,
    TextField,
    Tabs,
    Tab,
    Box
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
                return;
            }
            
            // 遍历 check_result 数组
            formValue.check_result.forEach(item => {
                if (item.type === 'sub') {
                    // 原始数据：读取 type = 'sub' 的 content
                    if (item.content) {
                        setShowData(item.content);
                    }
                    // 订阅链接：读取 type = 'sub' 的 url
                    if (item.url) {
                        const subUrl = item.url.startsWith('http') ? item.url : `${window.document.location.origin}/${item.url}`;
                        setUrl(subUrl);
                        setWithLocalLogoUrl(window.document.location.origin + "/q?url=/" + item.url);
                    }
                } else if (item.type === 'logo') {
                    // 本地 logo 链接：读取 type = 'logo' 的 content
                    if (item.content) {
                        setLocalLogoData(item.content);
                        setHasLogoType(true);
                    }
                }
            });
        };
        
        parseCheckResult();
    }, [formValue, open]);


    const downloadFile = async () => {
        _mainContext.saveFile();
        if (_mainContext.nowMod === 0) {
            // 根据当前 tab 打开对应的链接
            const downloadUrl = currentTab === 0 ? url : withLocalLogoUrl;
            window.open(downloadUrl);
        } else {
            // 根据当前 tab 下载对应的内容
            const content = currentTab === 0 ? showData : localLogoData;
            _mainContext.clientSaveFile(content, 'm3u');
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // 根据当前 tab 获取对应的链接和数据
    const currentLink = currentTab === 0 ? url : withLocalLogoUrl;
    const currentData = currentTab === 0 ? showData : localLogoData;
    const hasData = currentTab === 0 ? (showData !== '') : (localLogoData !== '');

    return (
        <Dialog onClose={() => onClose(false)} open={open} maxWidth="lg" fullWidth>
            <Box sx={{ width: '100%', minHeight: '400px' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <div>{t('订阅链接')}：<b>{currentLink}</b></div>
                    {hasData && (
                        <Box sx={{ mt: 1 }}>
                            <Button variant="text" onClick={() => downloadFile()}>{t('点击下载')}</Button>
                        </Box>
                    )}
                </Box>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange}>
                        <Tab label={t('原始数据')} />
                        {hasLogoType && <Tab label={t('本地Logo链接')} />}
                    </Tabs>
                </Box>

                <Box sx={{ p: 2 }}>
                    {currentTab === 0 && (
                        <>
                            {showData !='' ? (
                                <TextField
                                    multiline
                                    fullWidth
                                    minRows={15}
                                    maxRows={25}
                                    value={showData}
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
                    )}
                    
                    {currentTab === 1 && hasLogoType && (
                        <>
                            {localLogoData ? (
                                <TextField
                                    multiline
                                    fullWidth
                                    minRows={15}
                                    maxRows={25}
                                    value={localLogoData}
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
                    )}
                </Box>
            </Box>
        </Dialog>
    );
}; 