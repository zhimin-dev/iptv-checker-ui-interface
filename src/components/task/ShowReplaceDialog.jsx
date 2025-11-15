import * as React from 'react';
import { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { ApiTaskService } from '../../services/apiTaskService';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogTitle from '@mui/material/DialogTitle';
import {
    Dialog,
    Button,
} from '@mui/material';
import { MainContext } from '../../context/main';

export const ShowReplaceDialog = ({ onClose, formValue, open }) => {
    const { t } = useTranslation();
    const [replaceList, setReplaceList] = useState([]);
    const _mainContext = useContext(MainContext);
    const [showList, setShowList] = useState([]);

    const [taskService] = useState(() => new ApiTaskService());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await taskService.getReplaceList();
            console.log("response---", response);
            setReplaceList(response);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    useEffect(() => {
        if (!replaceList) {
            setShowList([]);
            return;
        }
        if (Array.isArray(replaceList)) {
            setShowList(replaceList.map(r => ({ key: r.key ?? '', value: r.value ?? '' })));
        } else if (typeof replaceList === 'object') {
            setShowList(Object.entries(replaceList).map(([k, v]) => ({ key: k, value: v ?? '' })));
        } else {
            setShowList([]);
        }
    }, [replaceList]);

    const handleChange = (index, field, value) => {
        setShowList(prev => {
            const copy = prev.map(r => ({ ...r }));
            copy[index][field] = value;
            return copy;
        });
    };

    const handleAddRow = () => {
        setShowList(prev => [...prev, { key: '', value: '' }]);
    };

    const handleRemoveRow = (index) => {
        setShowList(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        const result = {};
        showList.forEach(row => {
            if (row.key !== undefined && row.key !== '') {
                result[row.key] = row.value ?? '';
            }
        });
        setReplaceList(result);

        let postData = {
            "content": JSON.stringify(result)
        }

        try {
            await taskService.updateReplaceList(postData);
        } catch (err) {
            console.error('Error saving replace list:', err);
        }
    };
    // Render UI: rows + actions
    return (
        <Dialog onClose={() => onClose(false)} open={open}>
            <DialogTitle id="alert-dialog-title">
                {t('字符替换配置')}
            </DialogTitle>
            <div style={{padding: '0 20px 10px', fontSize: '12px', color: '#666'}}>
                <p style={{padding:'0',margin:'0'}}>{t('网络上的频道名前后经常出现一些特殊字符，可以通过添加该配置将这些字符替换掉，提升频道名的整洁度。')}</p>
                <p style={{padding:'0',margin:'0'}}>{t('比如频道名中出现“[HD]”，如果需要将这个字符去掉，添加一行：搜索值填写“[HD]”，替换值留空即可。')}</p>
            </div>
            <div>
                <div style={{ overflow: 'hidden', padding: '0 20px' }}>
                    <div style={{ maxHeight: '60vh', overflow: 'auto', padding: '12px 0' }}>
                        {showList.length === 0 ? (
                            <div style={{ padding: '8px 0', color: '#666' }}>{t('No items') || 'No items'}</div>
                        ) : (
                            showList.map((row, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        gap: 8,
                                        alignItems: 'center',
                                        marginBottom: 8,
                                    }}
                                >
                                    <TextField
                                        label={t('搜索值')}
                                        value={row.key}
                                        onChange={(e) => handleChange(idx, 'key', e.target.value)}
                                        size="small"
                                        style={{ width: 220 }}
                                    />
                                    <TextField
                                        label={t('替换值')}
                                        value={row.value}
                                        onChange={(e) => handleChange(idx, 'value', e.target.value)}
                                        size="small"
                                        style={{ flex: 1 }}
                                    />
                                    <IconButton aria-label="delete" onClick={() => handleRemoveRow(idx)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, padding: '12px 0', alignItems: 'center' }}>
                        <Button variant="contained" onClick={handleAddRow}>
                            {t('添加')}
                        </Button>

                        <div style={{ flex: 1 }} />

                        <Button variant="contained" color="primary" onClick={handleSave}>
                            {t('保存')}
                        </Button>
                        <Button variant="outlined" onClick={() => onClose(false)}>
                            {t('取消')}
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}; 