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
    CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import { ApiTaskService } from '../../services/apiTaskService';

const ChannelLogos = () => {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const [logos, setLogos] = useState({});
    const [searchKeyword, setSearchKeyword] = useState('');
    const [message, setMessage] = useState({ open: false, text: '', type: 'info' });
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchLogos();
    }, []);

    const fetchLogos = async () => {
        try {
            const data = await taskService.getChannelLogos();
            setLogos(data || {});
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

    const handleCloseMessage = () => {
        setMessage({ ...message, open: false });
    };

    const filteredLogos = Object.entries(logos)
        .filter(([name]) => name.toLowerCase().includes(searchKeyword.toLowerCase()));

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>{t('频道封面配置')}</Typography>

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
                {filteredLogos.map(([name, url]) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={name}>
                        <Card sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5', height: 100, alignItems: 'center' }}>
                                <Box 
                                    component="img" 
                                    src={url} 
                                    alt={name}
                                    sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/100?text=No+Img';
                                    }}
                                />
                            </Box>
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Tooltip title={name}>
                                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: '100%' }}>
                                        {name}
                                    </Typography>
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
