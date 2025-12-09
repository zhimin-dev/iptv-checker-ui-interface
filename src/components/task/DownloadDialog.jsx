import * as React from 'react';
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    Button,
    TextField
} from '@mui/material';
import { MainContext } from '../../context/main';

export const DownloadDialog = ({ onClose, formValue, open }) => {
    const { t } = useTranslation();
    const [showData, setShowData] = useState([]);
    const [url, setUrl] = useState('');
    const _mainContext = useContext(MainContext);

    useEffect(() => {
        setUrl(window.document.location.origin + "/" + formValue.url);
        if (formValue.content !== '') {
            setShowData(formValue.content);
        } else {
            setShowData('');
        }
    }, [formValue]);

    const downloadFile = async () => {
        _mainContext.saveFile();
        if (_mainContext.nowMod === 0) {
            window.open(url);
        } else {
            _mainContext.clientSaveFile(formValue.content, 'm3u');
        }
    };

    return (
        <Dialog onClose={() => onClose(false)} open={open}>
            <div style={{
                width: '960px',
                minHeight: '400px'
            }}>
                <div style={{
                    overflow: 'hidden',
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        zIndex: 9,
                    }}>
                        <div>{t('订阅链接')}：<b>{url}</b></div>
                        {showData !='' && (
                            <div>
                                <Button variant="text" onClick={() => downloadFile(formValue.url)}>{t('点击下载')}</Button>
                            </div>
                        )}
                    </div>
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
                        <div style={{ padding: "60px 0", position: 'relative' }}>
                            <div>{t('暂未生成')}</div>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}; 