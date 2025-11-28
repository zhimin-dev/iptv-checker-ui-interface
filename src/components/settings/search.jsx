import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { useTranslation } from "react-i18next";
import { ApiTaskService } from '../../services/apiTaskService';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';

const StringListEditor = ({ values, onChange, label, t, placeholder, validation }) => {
    const handleChange = (idx, val) => {
        const newValues = [...values];
        newValues[idx] = val;
        onChange(newValues);
    };
    const handleAdd = () => onChange([...values, '']);
    const handleRemove = (idx) => onChange(values.filter((_, i) => i !== idx));

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>{label}</Typography>
            {values.map((val, idx) => {
                const error = validation ? validation(val) : null;
                return (
                    <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                        <TextField
                            value={val}
                            onChange={(e) => handleChange(idx, e.target.value)}
                            size="small"
                            fullWidth
                            placeholder={placeholder}
                            error={!!error}
                            helperText={error}
                        />
                        <IconButton onClick={() => handleRemove(idx)} size="small" sx={{ mt: 0.5 }}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                );
            })}
            <Button startIcon={<AddIcon />} onClick={handleAdd} size="small" variant="outlined">{t('添加')}</Button>
        </Box>
    );
};

export default function SearchSettings() {
    const { t } = useTranslation();
    const [showLocal2RemoteSwitch, setShowLocal2RemoteSwitch] = useState(false);
    const [config, setConfig] = useState({
        remote_url2local_images: false,
        search: {
            source: [],
            extensions: [],
            search_list: []
        },
        today_fetch: false
    });
    const [taskService] = useState(() => new ApiTaskService());
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [resultData, setResultData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const availableExtensions = ['.txt', '.m3u'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await taskService.getSearchConfig();
            if (response) {
                setConfig({
                    remote_url2local_images: response.remote_url2local_images ?? false,
                    search: {
                        source: response.search?.source ?? [],
                        extensions: response.search?.extensions ?? [],
                        search_list: response.search?.search_list ?? []
                    },
                    today_fetch: response.today_fetch ?? false
                });
            }
        } catch (error) {
            console.error('Error fetching search config:', error);
        }
    }

    const handleRunSpider = async () => {
        setIsProcessing(true);
        try {
            if (config.today_fetch) {
                await taskService.clearSearchFolder();
                setSnackbarMsg(t('清理成功'));
            } else {
                await taskService.initSearchData();
                setSnackbarMsg(t('开始爬取'));
            }
            setOpenSnackbar(true);
            await fetchData();
        } catch (error) {
            setSnackbarMsg(t('操作失败'));
            setOpenSnackbar(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleShowResults = async () => {
        try {
            const data = await taskService.getTodayFiles();
            setResultData(data || []);
            setShowResultDialog(true);
        } catch (error) {
            console.error('Error fetching results:', error);
            setSnackbarMsg(t('获取结果失败'));
            setOpenSnackbar(true);
        }
    };

    const handleSave = async () => {
        const cleanConfig = {
            ...config,
            search: {
                ...config.search,
                source: config.search.source.map(s => ({
                    ...s,
                    urls: s.urls.filter(u => u.trim()),
                    include_files: s.include_files.filter(f => f.trim())
                }))
            }
        };

        try {
            await taskService.updateSearchConfig(cleanConfig);
            setConfig(cleanConfig);
            setSnackbarMsg(t('保存成功'));
            setOpenSnackbar(true);
        } catch (err) {
            console.error('Error saving search config:', err);
            setSnackbarMsg(t('保存失败'));
            setOpenSnackbar(true);
        }
    };

    const handleSwitchChange = (e) => {
        setConfig(prev => ({ ...prev, remote_url2local_images: e.target.checked }));
    };

    const sourceTypes = [
        { value: 'github-home-page', label: t('GitHub 主页') },
        { value: 'raw-source', label: t('原始源') },
        { value: 'github-sub-page', label: t('GitHub 子页面') },
    ];

    const canAddSource = config.search.source.length < sourceTypes.length;

    const handleAddSource = () => {
        if (!canAddSource) return;

        // Find first unused type
        const usedTypes = config.search.source.map(s => s.parse_type);
        const nextType = sourceTypes.find(t => !usedTypes.includes(t.value))?.value || 'raw-source';

        setConfig(prev => ({
            ...prev,
            search: {
                ...prev.search,
                source: [...prev.search.source, { urls: [], include_files: [], parse_type: nextType }]
            }
        }));
    };

    const handleRemoveSource = (index) => {
        setConfig(prev => ({
            ...prev,
            search: {
                ...prev.search,
                source: prev.search.source.filter((_, i) => i !== index)
            }
        }));
    };

    const handleSourceChange = (index, field, value) => {
        setConfig(prev => {
            const newSource = [...prev.search.source];
            const sourceCopy = { ...newSource[index] };
            sourceCopy[field] = value;
            newSource[index] = sourceCopy;
            return {
                ...prev,
                search: { ...prev.search, source: newSource }
            };
        });
    };

    const validateUrl = (url) => {
        if (!url) return null;
        try {
            new URL(url);
            return null;
        } catch (_) {
            return t('无效链接') || 'Invalid URL';
        }
    };

    return (
        <Box style={{ padding: '0 20px', width: '100%', maxWidth: '1000px' }}>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMsg}
            />

            <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    {config.today_fetch ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {isProcessing ? <CircularProgress size={24} /> : (
                                <Button variant="contained" color="warning" onClick={handleRunSpider}>{t('清理结果')}</Button>
                            )}
                            {/* Since we don't have last_run, we might omit it or fetch it if possible */}
                            <Button variant="outlined" onClick={handleShowResults}>{t('查看结果')}</Button>
                        </Box>
                    ) : (
                        isProcessing ? <CircularProgress size={24} /> : (
                            <Button variant="contained" onClick={handleRunSpider}>{t('立即爬取')}</Button>
                        )
                    )}
                </Box>
            </Box>

            {
                showLocal2RemoteSwitch ? (

                    <Box sx={{ mb: 3 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={config.remote_url2local_images}
                                    onChange={handleSwitchChange}
                                />
                            }
                            label={t('将远程图片转换为本地图片')}
                        />
                    </Box>
                ) : null
            }

            <Typography variant="h6" gutterBottom>{t('文件扩展名')}</Typography>
            <Box sx={{ mb: 3 }}>
                <FormGroup row>
                    {availableExtensions.map(ext => (
                        <FormControlLabel
                            key={ext}
                            control={
                                <Checkbox
                                    checked={config.search.extensions.includes(ext)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setConfig(prev => {
                                            const newExts = checked
                                                ? [...prev.search.extensions, ext]
                                                : prev.search.extensions.filter(x => x !== ext);
                                            return { ...prev, search: { ...prev.search, extensions: newExts } };
                                        });
                                    }}
                                />
                            }
                            label={ext}
                        />
                    ))}
                </FormGroup>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{t('搜索源')}</Typography>
                {canAddSource && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddSource}>
                        {t('添加源')}
                    </Button>
                )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {config.search.source.map((source, index) => (
                    <Card key={index} variant="outlined">
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <FormControl size="small" sx={{ width: 200 }}>
                                    <InputLabel>{t('解析类型')}</InputLabel>
                                    <Select
                                        value={source.parse_type}
                                        label={t('解析类型')}
                                        onChange={(e) => handleSourceChange(index, 'parse_type', e.target.value)}
                                    >
                                        {sourceTypes.map(type => {
                                            const isUsed = config.search.source.some(s => s.parse_type === type.value);
                                            const disabled = isUsed && type.value !== source.parse_type;
                                            return (
                                                <MenuItem key={type.value} value={type.value} disabled={disabled}>{type.label}</MenuItem>
                                            );
                                        })}
                                    </Select>
                                </FormControl>
                                <IconButton onClick={() => handleRemoveSource(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>

                            <StringListEditor
                                label={t('URL地址')}
                                values={source.urls || []}
                                placeholder='http://...'
                                onChange={(val) => handleSourceChange(index, 'urls', val)}
                                t={t}
                                validation={validateUrl}
                            />

                            {source.parse_type !== 'raw-source' && (
                                <StringListEditor
                                    label={t('包含文件')}
                                    values={source.include_files || []}
                                    placeholder='xxx.m3u8'
                                    onChange={(val) => handleSourceChange(index, 'include_files', val)}
                                    t={t}
                                />
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 4 }}>
                <Button variant="contained" color="primary" onClick={handleSave} size="large">
                    {t('保存配置')}
                </Button>
            </Box>

            <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{t('爬取结果')}</DialogTitle>
                <DialogContent>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }} variant="scrollable" scrollButtons="auto">
                        {resultData.map((r, i) => <Tab key={i} label={r.name || r.label || `Result ${i+1}`} />)}
                    </Tabs>
                    <Box sx={{ p: 2, height: 400, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                        {resultData[tabValue]?.content || t('无内容')}
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
