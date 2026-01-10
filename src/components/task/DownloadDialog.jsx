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
    CircularProgress
} from '@mui/material';
import { ApiTaskService } from '../../services/apiTaskService';
import { MainContext } from '../../context/main';

export const DownloadDialog = ({ onClose, formValue, open }) => {
    const { t } = useTranslation();
    const [showData, setShowData] = useState([]);
    const [localLogoData, setLocalLogoData] = useState('');
    const [url, setUrl] = useState('');
    const [withLocalLogoUrl, setWithLocalLogoUrl] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [loadingContent, setLoadingContent] = useState(false);
    const taskService = new ApiTaskService();
    const _mainContext = useContext(MainContext);

    useEffect(() => {
        if (!open) return; // 对话框未打开时不执行
        
        setUrl(window.document.location.origin + "/" + formValue.url);
        setWithLocalLogoUrl(window.document.location.origin + "/q?url=/" + formValue.url);
        
        // 重置数据
        setShowData('');
        setLocalLogoData('');
        
        // 如果有 task_id，请求任务内容
        const fetchTaskContent = async () => {
            if (!formValue.task_id) {
                // 如果没有 task_id，使用原有的 content
                if (formValue.content !== '') {
                    setShowData(formValue.content);
                }
                return;
            }
            
            setLoadingContent(true);
            try {
                const host = window.document.location.origin;
                const data = await taskService.getTaskContent(formValue.task_id, host);
                
                // 根据返回的数组设置数据
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        if (item.type === 'logo' && item.content) {
                            setLocalLogoData(item.content);
                        } else if (item.type === 'sub' && item.content) {
                            setShowData(item.content);
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching task content:', error);
                // 如果请求失败，使用原有的 content
                if (formValue.content !== '') {
                    setShowData(formValue.content);
                }
            } finally {
                setLoadingContent(false);
            }
        };
        
        fetchTaskContent();
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
                        <Tab label={t('本地Logo链接')} />
                    </Tabs>
                </Box>

                <Box sx={{ p: 2 }}>
                    {loadingContent ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', padding: "60px 0" }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
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
                            
                            {currentTab === 1 && (
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
                        </>
                    )}
                </Box>
            </Box>
        </Dialog>
    );
}; 