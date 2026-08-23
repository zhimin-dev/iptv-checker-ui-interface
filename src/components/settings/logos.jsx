import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Card, CardContent, Snackbar, Alert,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, TextField, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Pagination,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import { ApiTaskService } from '../../services/apiTaskService';

/**
 * 频道图标（统一配置）：频道图标 + 分组 + tvg-id 合并为一组配置，支持分页。
 * 上传/爬取绑定的图标会自动进入此列表，可在此编辑别名、tvg-id 与分组。
 */
const ChannelLogos = () => {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const PAGE_SIZE = 20;
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ open: false, text: '', type: 'info' });

    // 编辑弹窗
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

    const handleDelete = async (item) => {
        try {
            await taskService.deleteChannelIcon(item.name);
            setItems((prev) => prev.filter((i) => i.name !== item.name));
            showMsg(t('删除成功'), 'success');
        } catch (e) {
            showMsg(t('删除失败'), 'error');
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
                    <Typography variant="caption" color="textSecondary">
                        {t('频道图标统一配置说明')}
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

            {/* 统一配置表格（频道图标 + 分组 + tvg-id） */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {t('频道图标')}（{items.length}）
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {t('频道图标统一配置说明2')}
                        </Typography>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : items.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                            {t('暂无数据')}
                        </Typography>
                    ) : (
                        <TableContainer sx={{ maxHeight: 560 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('图标')}</TableCell>
                                        <TableCell>{t('频道名')}</TableCell>
                                        <TableCell>{t('别名')}</TableCell>
                                        <TableCell>tvg-id</TableCell>
                                        <TableCell>{t('分组')}</TableCell>
                                        <TableCell align="right">{t('操作')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pagedItems.map((item) => (
                                        <TableRow key={item.name} hover>
                                            <TableCell>
                                                <Box
                                                    component="img"
                                                    src={item.logo}
                                                    alt={item.name}
                                                    sx={{ width: 56, height: 40, objectFit: 'contain', display: 'block', bgcolor: '#f5f5f5', borderRadius: 0.5 }}
                                                    onError={(ev) => { ev.target.style.visibility = 'hidden'; }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" color="textSecondary">
                                                    {(item.aliases || []).join(', ') || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{item.tvg_id || '-'}</TableCell>
                                            <TableCell>{item.group || '-'}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" color="primary" onClick={() => handleOpenEdit(item)} title={t('编辑')}>
                                                    <DriveFileRenameOutlineIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(item)} title={t('删除')}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
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
                </CardContent>
            </Card>

            {/* 编辑弹窗：别名 / tvg-id / 分组 */}
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
                        <TextField
                            size="small"
                            label="tvg-id"
                            value={editDialog.item?.tvg_id || ''}
                            onChange={(e) => setEditField('tvg_id', e.target.value)}
                            fullWidth
                            helperText={t('用于 EPG 节目单匹配，可为空')}
                        />
                        <TextField
                            size="small"
                            label={t('分组')}
                            value={editDialog.item?.group || ''}
                            onChange={(e) => setEditField('group', e.target.value)}
                            fullWidth
                            helperText={t('检查时自动应用到该频道的 group-title')}
                        />
                        <TextField
                            size="small"
                            label={t('图标地址')}
                            value={editDialog.item?.logo || ''}
                            InputProps={{ readOnly: true }}
                            fullWidth
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
