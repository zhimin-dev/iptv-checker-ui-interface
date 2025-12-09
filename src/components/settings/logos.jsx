import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Card, 
    CardContent, 
    Grid,
    IconButton,
    InputAdornment,
    Snackbar,
    Alert,
    CardMedia,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useTranslation } from 'react-i18next';
import { ApiTaskService } from '../../services/apiTaskService';

const ChannelLogos = () => {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const [logos, setLogos] = useState({});
    const [inputName, setInputName] = useState('');
    const [inputLogo, setInputLogo] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [message, setMessage] = useState({ open: false, text: '', type: 'info' });
    const [existingLogo, setExistingLogo] = useState(null);

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

    const handleNameChange = (e) => {
        const name = e.target.value;
        setInputName(name);
        if (logos[name]) {
            setExistingLogo(logos[name]);
        } else {
            setExistingLogo(null);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await taskService.uploadFile(formData);
            if (res.url) {
                setInputLogo(res.url);
            } else {
                setMessage({ open: true, text: t('上传失败，未获取到URL'), type: 'error' });
            }
        } catch (error) {
            console.error('Upload failed', error);
            setMessage({ open: true, text: t('操作失败'), type: 'error' });
        }
    };

    const handleAdd = async () => {
        if (!inputName) {
            setMessage({ open: true, text: t('请先输入频道名称'), type: 'warning' });
            return;
        }
        if (!inputLogo) {
             setMessage({ open: true, text: t('请先上传或选择图片'), type: 'warning' });
             return;
        }

        const newLogos = { ...logos, [inputName]: inputLogo };
        try {
            await taskService.saveChannelLogos(newLogos);
            setLogos(newLogos);
            setInputName('');
            setInputLogo('');
            setExistingLogo(null);
            setMessage({ open: true, text: t('添加成功'), type: 'success' });
        } catch (error) {
            console.error('Save failed', error);
            setMessage({ open: true, text: t('保存失败'), type: 'error' });
        }
    };

    const handleDelete = async (name) => {
        if (!window.confirm(t('确定要删除吗') + `: ${name}?`)) {
            return;
        }
        const newLogos = { ...logos };
        delete newLogos[name];
        try {
            await taskService.saveChannelLogos(newLogos);
            setLogos(newLogos);
            setMessage({ open: true, text: t('删除成功'), type: 'success' });
        } catch (error) {
             setMessage({ open: true, text: t('保存失败'), type: 'error' });
        }
    };

    const handleCloseMessage = () => {
        setMessage({ ...message, open: false });
    };

    const filteredLogos = Object.entries(logos)
        .filter(([name]) => name.toLowerCase().includes(searchKeyword.toLowerCase()));

    return (
        <Box sx={{ width: '100%', p: 2, maxWidth: 1200, margin: '0 auto' }}>
            <Typography variant="h5" sx={{ mb: 3 }}>{t('频道封面配置')}</Typography>

            {/* Add Section */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label={t('频道名称')}
                            value={inputName}
                            onChange={handleNameChange}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            label={t('图片地址')}
                            value={inputLogo}
                            onChange={(e) => setInputLogo(e.target.value)}
                            size="small"
                            disabled // Mainly populated by upload, but could be editable. User said "upload".
                        />
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            {t('上传图片')}
                            <input type="file" hidden accept="image/*" onChange={handleUpload} />
                        </Button>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={handleAdd}
                        >
                            {t('添加')}/{t('更新')}
                        </Button>
                    </Grid>
                </Grid>
                
                {/* Preview Section */}
                <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
                    {existingLogo && (
                        <Box>
                            <Typography variant="caption" color="textSecondary">{t('已存在封面')}:</Typography>
                            <Box 
                                component="img" 
                                src={existingLogo} 
                                sx={{ height: 60, display: 'block', mt: 1, border: '1px solid #eee' }} 
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </Box>
                    )}
                    {inputLogo && (
                        <Box>
                            <Typography variant="caption" color="textSecondary">{t('当前预览')}:</Typography>
                            <Box 
                                component="img" 
                                src={inputLogo} 
                                sx={{ height: 60, display: 'block', mt: 1, border: '1px solid #eee' }} 
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </Box>
                    )}
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
                            <CardContent sx={{ p: 1.5, flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Tooltip title={name}>
                                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: '70%' }}>
                                        {name}
                                    </Typography>
                                </Tooltip>
                                <IconButton size="small" color="error" onClick={() => handleDelete(name)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
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
