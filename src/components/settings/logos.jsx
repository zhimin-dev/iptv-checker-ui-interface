import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Card, 
    CardContent, 
    Grid,
    InputAdornment,
    Snackbar,
    Alert,
    Tooltip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Chip,
    Stack,
    Switch,
    FormControlLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useTranslation } from 'react-i18next';
import { ApiTaskService } from '../../services/apiTaskService';

const ChannelLogos = () => {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const [config, setConfig] = useState({
        host: '',
        remote_url2local_images: false,
        logos: []
    });
    const [searchKeyword, setSearchKeyword] = useState('');
    const [message, setMessage] = useState({ open: false, text: '', type: 'info' });
    const [isUploading, setIsUploading] = useState(false);
    const [crawledLogos, setCrawledLogos] = useState([]);
    const [selectedLogoIds, setSelectedLogoIds] = useState(new Set());
    const [bindNames, setBindNames] = useState('');
    
    // Alias Dialog State
    const [aliasDialog, setAliasDialog] = useState({ 
        open: false, 
        sourceName: '', 
        sourceUrl: '', 
        currentAliases: [], 
        newAlias: '' 
    });

    useEffect(() => {
        fetchLogos();
        fetchCrawledLogos();
    }, []);

    const fetchCrawledLogos = async () => {
        try {
            const data = await taskService.getCrawledLogos();
            setCrawledLogos(data.list || []);
        } catch (e) {
            console.error('Error fetching crawled logos:', e);
        }
    };

    const toggleSelectLogo = (id) => {
        setSelectedLogoIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleBindCrawled = async () => {
        const names = bindNames.split(/[,，\s]+/).map((n) => n.trim()).filter(Boolean);
        if (names.length === 0 || selectedLogoIds.size === 0) {
            setMessage({ open: true, text: t('请选择封面并输入频道名'), type: 'warning' });
            return;
        }
        try {
            await taskService.bindCrawledLogos(Array.from(selectedLogoIds), names);
            setSelectedLogoIds(new Set());
            setBindNames('');
            setMessage({ open: true, text: t('绑定成功'), type: 'success' });
            fetchCrawledLogos();
            fetchLogos();
        } catch (e) {
            setMessage({ open: true, text: t('绑定失败'), type: 'error' });
        }
    };

    const handleClearCrawled = async () => {
        try {
            await taskService.clearCrawledLogos();
            setSelectedLogoIds(new Set());
            setMessage({ open: true, text: t('清空成功'), type: 'success' });
            fetchCrawledLogos();
        } catch (e) {
            setMessage({ open: true, text: t('清空失败'), type: 'error' });
        }
    };

    const fetchLogos = async () => {
        try {
            const data = await taskService.getChannelLogos();
            const baseConfig = await taskService.getBaseConfig().catch(() => ({}));
            const host = baseConfig?.host ?? '';
            if (data && data.logos) {
                setConfig({ ...data, host });
            } else if (Array.isArray(data)) {
                setConfig(prev => ({ ...prev, logos: data, host }));
            } else {
                setConfig(prev => ({ ...prev, host }));
            }
        } catch (error) {
            console.error('Error fetching logos:', error);
        }
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
            
        try {
            await taskService.uploadLogos(formData);
            await fetchLogos();
            setMessage({ 
                open: true, 
                text: t('上传完成'), 
                type: 'success' 
            });
        } catch (error) {
            console.error('Upload failed', error);
            setMessage({ open: true, text: t('上传失败'), type: 'error' });
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleOpenAlias = (name, url, allAliases) => {
        setAliasDialog({ 
            open: true, 
            sourceName: name, 
            sourceUrl: url, 
            currentAliases: allAliases || [], 
            newAlias: '' 
        });
    };

    const handleCloseAlias = () => {
        setAliasDialog({ open: false, sourceName: '', sourceUrl: '', currentAliases: [], newAlias: '' });
    };

    const handleAddChip = () => {
        const val = aliasDialog.newAlias.trim();
        if (!val) return;
        if (aliasDialog.currentAliases.includes(val)) {
             setMessage({ open: true, text: t('别名已存在'), type: 'warning' });
             return;
        }
        setAliasDialog(prev => ({
            ...prev,
            currentAliases: [...prev.currentAliases, val],
            newAlias: ''
        }));
    };

    const handleDeleteChip = (aliasToDelete) => {
        setAliasDialog(prev => ({
            ...prev,
            currentAliases: prev.currentAliases.filter(alias => alias !== aliasToDelete)
        }));
    };

    const handleSaveAlias = async () => {
        try {
            await taskService.updateLogo({
                url: aliasDialog.sourceUrl,
                name: aliasDialog.currentAliases
            });
            await fetchLogos();
            setMessage({ open: true, text: t('保存成功'), type: 'success' });
            handleCloseAlias();
        } catch (error) {
            console.error('Save alias failed', error);
            setMessage({ open: true, text: t('保存失败'), type: 'error' });
        }
    };

    const handleCloseMessage = () => {
        setMessage({ ...message, open: false });
    };

    const displayLogos = config.logos.reduce((acc, logo) => {
        if (logo.name && Array.isArray(logo.name)) {
            logo.name.forEach(n => {
                acc.push({ name: n, url: logo.url, allNames: logo.name });
            });
        }
        return acc;
    }, []);

    const filteredLogos = displayLogos.filter(item => 
        item.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <Box sx={{ width: '100%', p: 2 }}>
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

            {/* 爬取的封面整理区 */}
            {crawledLogos.length > 0 ? (
                <Card sx={{ mb: 3, p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {t('爬取的封面')}（{crawledLogos.length}）
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {t('爬取封面说明')}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button variant="outlined" size="small" color="error" onClick={handleClearCrawled}>
                                {t('清空')}
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <TextField
                                size="small"
                                label={t('绑定到频道名（逗号分隔）')}
                                placeholder={t('例如：CCTV-1, 湖南卫视')}
                                value={bindNames}
                                onChange={(e) => setBindNames(e.target.value)}
                                sx={{ minWidth: 320, flexGrow: 1 }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                disabled={selectedLogoIds.size === 0}
                                onClick={handleBindCrawled}
                            >
                                {t('绑定所选封面')}（{selectedLogoIds.size}）
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {crawledLogos.map((item) => (
                                <Box
                                    key={item.id}
                                    onClick={() => toggleSelectLogo(item.id)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: selectedLogoIds.has(item.id) ? '2px solid #1976d2' : '2px solid transparent',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        bgcolor: '#f5f5f5',
                                        width: 96,
                                        position: 'relative',
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={item.url}
                                        alt={item.names?.[0] || ''}
                                        sx={{ width: '100%', height: 64, objectFit: 'contain', display: 'block' }}
                                    />
                                    <Box sx={{ p: 0.5 }}>
                                        <Typography variant="caption" noWrap sx={{ display: 'block', fontSize: 10 }}>
                                            {item.names?.[0] || '-'}
                                        </Typography>
                                    </Box>
                                    {selectedLogoIds.has(item.id) ? (
                                        <Box sx={{ position: 'absolute', top: 2, right: 2, width: 12, height: 12, borderRadius: '50%', bgcolor: '#1976d2' }} />
                                    ) : null}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Card>
            ) : null}

            {/* Search & List Section */}
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    placeholder={t('搜索频道')}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    size="small"
                />
            </Box>

            <Grid container spacing={2}>
                {filteredLogos.map((item, idx) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={`${item.name}-${idx}`}>
                        <Card sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5', height: 100, alignItems: 'center' }}>
                                <Box 
                                    component="img" 
                                    src={item.url.startsWith('http') ? item.url : `${config.host}${item.url}`} 
                                    alt={item.name}
                                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            </Box>
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Tooltip title={item.name}>
                                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: '70%' }}>
                                        {item.name}
                                    </Typography>
                                </Tooltip>
                                <Tooltip title={t('编辑别名')}>
                                    <IconButton size="small" color="primary" onClick={() => handleOpenAlias(item.name, item.url, item.allNames)}>
                                        <DriveFileRenameOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {filteredLogos.length === 0 && (
                    <Grid item xs={12}>
                        <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
                            {t('暂无数据')}
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {/* Alias Dialog */}
            <Dialog open={aliasDialog.open} onClose={handleCloseAlias} maxWidth="sm" fullWidth>
                <DialogTitle>{t('编辑别名')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                             <Box 
                                component="img" 
                                src={aliasDialog.sourceUrl.startsWith('http') ? aliasDialog.sourceUrl : `${config.host}${aliasDialog.sourceUrl}`} 
                                sx={{ maxHeight: 100, maxWidth: '100%', objectFit: 'contain' }} 
                             />
                        </Box>

                        <Typography variant="subtitle2" gutterBottom>{t('已有别名')}</Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
                            {aliasDialog.currentAliases.map((alias) => (
                                <Chip 
                                    key={alias} 
                                    label={alias} 
                                    onDelete={() => handleDeleteChip(alias)} 
                                />
                            ))}
                            {aliasDialog.currentAliases.length === 0 && (
                                <Typography variant="caption" color="textSecondary">
                                    {t('暂无别名')}
                                </Typography>
                            )}
                        </Stack>

                        <Typography variant="subtitle2" gutterBottom>{t('新增别名')}</Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label={t('输入别名')}
                                value={aliasDialog.newAlias}
                                onChange={(e) => setAliasDialog({ ...aliasDialog, newAlias: e.target.value })}
                                onKeyPress={(e) => { if (e.key === 'Enter') handleAddChip(); }}
                            />
                            <Button onClick={handleAddChip} variant="contained" size="small">
                                {t('添加')}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAlias}>{t('取消')}</Button>
                    <Button onClick={handleSaveAlias} variant="contained" color="primary">{t('保存')}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={message.open} 
                autoHideDuration={3000} 
                onClose={handleCloseMessage}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseMessage} severity={message.type} sx={{ width: '100%' }}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ChannelLogos;
