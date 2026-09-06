import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import { ApiTaskService } from '../../services/apiTaskService';

/**
 * AI 配置：DeepSeek API Key / Base URL / 模型。
 * 配置后可在「AI 整理」页使用 AI 自动整理频道。
 */
export default function AiConfigPage() {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('https://api.deepseek.com');
    const [model, setModel] = useState('deepseek-chat');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ open: false, text: '', type: 'info' });

    useEffect(() => {
        taskService.getAiConfig().then((data) => {
            if (data && data.api_key) setApiKey(data.api_key);
            if (data && data.base_url) setBaseUrl(data.base_url);
            if (data && data.model) setModel(data.model);
        }).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await taskService.saveAiConfig({ api_key: apiKey.trim(), base_url: baseUrl.trim(), model: model.trim() });
            setMessage({ open: true, text: t('保存成功'), type: 'success' });
        } catch (e) {
            setMessage({ open: true, text: t('保存失败'), type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box style={{ padding: '0 20px', width: '100%', maxWidth: '640px' }}>
            <Snackbar open={message.open} autoHideDuration={3000} onClose={() => setMessage({ ...message, open: false })}>
                <Alert severity={message.type} sx={{ width: '100%' }}>{message.text}</Alert>
            </Snackbar>
            <Paper sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    {t('aiConfigTitle')}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    {t('aiConfigDesc')}
                </Typography>
                <TextField
                    size="small"
                    type="password"
                    label={t('aiApiKey')}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                />
                <TextField
                    size="small"
                    label={t('aiBaseUrl')}
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.deepseek.com"
                />
                <TextField
                    size="small"
                    label={t('aiModel')}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="deepseek-chat"
                />
                <Box>
                    <Button variant="contained" disabled={saving} onClick={handleSave}>
                        {saving ? t('保存中...') : t('保存')}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
