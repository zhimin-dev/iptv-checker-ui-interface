import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Card, CardContent, Snackbar, Alert,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Pagination,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import { ApiTaskService } from '../../services/apiTaskService';

/**
 * 频道图标：只展示图标本身（纯图片网格，分页）。
 * 点击图标可编辑别名（匹配用）；上传的图标自动进入此列表。
 * 分组与 tvg-id 的批量配置请使用「分组绑定」页面。
 */
const ChannelLogos = () => {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const PAGE_SIZE = 48;
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ open: false, text: '', type: 'info' });

    // 编辑弹窗（别名/名称）
    const [editDialog, setEditDialog] = useState({ open: false, item: null, aliasesText: '' });
    const [saving, setSaving] = useState(false);

    const showMsg = (text, type) => setMessage({ open: true, text, type });

    const fetchIcons = async () => {
        setLoading(true);
        try {
            const data = await taskService.getChannelIcons();
            setItems(data.items || []);
        } catch (e) {
            console.error(e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIcons();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pagedItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setIsUploading(true);
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        try {
            await taskService.uploadLogos(formData);
            showMsg(t('上传完成'), 'success');
            fetchIcons();
        } catch (error) {
            console.error('Upload failed', error);
            showMsg(t('上传失败'), 'error');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleOpenEdit = (item) => {
        setEditDialog({
            open: true,
            item: { ...item },
            aliasesText: (item.aliases || []).join(', '),
        });
    };

    const handleCloseEdit = () => {
        setEditDialog({ open: false, item: null, aliasesText: '' });
    };

    const handleSaveEdit = async () => {
        const item = editDialog.item;
        if (!item) return;
        const aliases = editDialog.aliasesText
            .split(/[,，\s]+/)
            .map((s) => s.trim())
            .filter(Boolean);
        const updated = { ...item, aliases };
        const next = items.map((i) => (i.name === item.name ? updated : i));
        setSaving(true);
        try {
            await taskService.saveChannelIcons(next);
            setItems(next);
            showMsg(t('保存成功'), 'success');
            handleCloseEdit();
        } catch (e) {
            showMsg(t('保存失败'), 'error');
        } finally {
            setSaving(false);
        }
    };

    const setEditField = (key, value) => {
        setEditDialog((prev) => ({ ...prev, item: { ...prev.item, [key]: value } }));
    };

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Snackbar open={message.open} autoHideDuration={3000} onClose={() => setMessage({ ...message, open: false })}>
                <Alert severity={message.type} sx={{ width: '100%' }}>{message.text}</Alert>
            </Snackbar>

            {/* Upload Section */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                    <Typography variant="body2" color="textSecondary">
                        {t('上传的文件名就是电视频道名称')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                            disabled={isUploading}
                        >
                            {isUploading ? t('正在上传...') : t('批量上传图片')}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                multiple
                                onChange={handleUpload}
                            />
                        </Button>
                    </Box>
                </Box>
            </Card>

            {/* 纯图标网格 */}
            <Card>
                <CardContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : items.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                            {t('暂无数据')}
                        </Typography>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {pagedItems.map((item) => (
                                    <Box
                                        key={item.name}
                                        onClick={() => handleOpenEdit(item)}
                                        title={item.name}
                                        sx={{
                                            width: 120,
                                            p: 0.5,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            bgcolor: '#fafafa',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            border: '1px solid transparent',
                                            '&:hover': { borderColor: 'primary.main' },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 64,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {item.logo ? (
                                                <Box
                                                    component="img"
                                                    src={item.logo}
                                                    alt={item.name}
                                                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                                                    onError={(ev) => { ev.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">-</Typography>
                                            )}
                                        </Box>
                                        <Typography variant="caption" noWrap sx={{ maxWidth: '100%', fontWeight: 500 }}>
                                            {item.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            noWrap
                                            sx={{ maxWidth: '100%', color: 'text.secondary', fontSize: 10 }}
                                        >
                                            {(item.aliases || []).join(', ')}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            {items.length > PAGE_SIZE ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                                    <Pagination
                                        count={Math.ceil(items.length / PAGE_SIZE)}
                                        page={page + 1}
                                        onChange={(e, v) => setPage((v || 1) - 1)}
                                        size="small"
                                        showFirstButton
                                        showLastButton
                                    />
                                </Box>
                            ) : null}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* 编辑弹窗：别名 */}
            <Dialog open={editDialog.open} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
                <DialogTitle>{t('编辑频道图标')}：{editDialog.item?.name || ''}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            size="small"
                            label={t('频道名')}
                            value={editDialog.item?.name || ''}
                            onChange={(e) => setEditField('name', e.target.value)}
                            fullWidth
                        />
                        <TextField
                            size="small"
                            label={t('别名（逗号分隔）')}
                            value={editDialog.aliasesText}
                            onChange={(e) => setEditDialog((prev) => ({ ...prev, aliasesText: e.target.value }))}
                            fullWidth
                            helperText={t('别名也会参与图标匹配，例如 cctv1、cctv-1')}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>{t('取消')}</Button>
                    <Button variant="contained" disabled={saving} onClick={handleSaveEdit}>
                        {saving ? t('保存中...') : t('保存')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChannelLogos;
