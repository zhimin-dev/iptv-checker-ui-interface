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
    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [message, setMessage] = useState({ open: false, text: '', type: 'info' });
    const [isUploading, setIsUploading] = useState(false);
    
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
    }, []);

    const fetchLogos = async () => {
        try {
            const data = await taskService.getChannelLogos();
            if (data && data.logos) {
                setConfig(data);
            } else if (Array.isArray(data)) {
                // 兼容旧格式
                setConfig(prev => ({ ...prev, logos: data }));
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

    const handleSaveConfig = async () => {
        try {
            await taskService.saveChannelLogosConfig(config);
            setMessage({ open: true, text: t('保存成功'), type: 'success' });
            setIsEditingConfig(false);
        } catch (error) {
            console.error('Save config failed', error);
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
            {/* Global Config Section */}
            <Card sx={{ mb: 3, p: 2 }}>
                {!isEditingConfig ? (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>{t('全局 Host')}:</strong> {config.host || t('未设置')}
                            </Typography>
                            <Typography variant="body2">
                                <strong>{t('将远程图片转换为本地图片')}:</strong> {config.remote_url2local_images ? t('已启用') : t('已禁用')}
                            </Typography>
                        </Box>
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => setIsEditingConfig(true)}
                        >
                            {t('修改配置')}
                        </Button>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        <TextField
                            label={t('全局 Host (可选)')}
                            value={config.host || ''}
                            onChange={(e) => setConfig({ ...config, host: e.target.value })}
                            size="small"
                            fullWidth
                            placeholder="http://localhost:5173"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={config.remote_url2local_images}
                                    onChange={(e) => setConfig({ ...config, remote_url2local_images: e.target.checked })}
                                />
                            }
                            label={t('将远程图片转换为本地图片')}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" onClick={handleSaveConfig} size="small">
                                {t('保存配置')}
                            </Button>
                            <Button variant="outlined" onClick={() => setIsEditingConfig(false)} size="small">
                                {t('取消')}
                            </Button>
                        </Box>
                    </Stack>
                )}
            </Card>

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
