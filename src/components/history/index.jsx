import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useTranslation } from "react-i18next";
import { ApiTaskService } from '../../services/apiTaskService';

const PAGE_SIZE = 20;

export default function HistoryPage() {
    const { t } = useTranslation();
    const [tab, setTab] = useState(0);
    const [playList, setPlayList] = useState([]);
    const [playTotal, setPlayTotal] = useState(0);
    const [playPage, setPlayPage] = useState(0);
    const [searchList, setSearchList] = useState([]);
    const [searchTotal, setSearchTotal] = useState(0);
    const [searchPage, setSearchPage] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [onlyPlayable, setOnlyPlayable] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const taskService = new ApiTaskService();

    const showMsg = (msg) => {
        setSnackbarMsg(msg);
        setOpenSnackbar(true);
    };

    const loadPlay = async (kw, playable, page) => {
        try {
            const data = await taskService.getPlayHistory(kw, playable, page, PAGE_SIZE);
            setPlayList(data.list || []);
            setPlayTotal(data.total || 0);
            setPlayPage(data.page || 0);
        } catch (e) {
            console.error(e);
        }
    };

    const loadSearch = async (page) => {
        try {
            const data = await taskService.getSearchHistory('', 20, page, PAGE_SIZE);
            setSearchList(data.list || []);
            setSearchTotal(data.total || 0);
            setSearchPage(data.page || 0);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadPlay('', undefined, 0);
        loadSearch(0);
    }, []);

    const fmtTime = (secs) => {
        if (!secs) return '-';
        return new Date(secs * 1000).toLocaleString();
    };

    const handleDeletePlay = async (id) => {
        await taskService.deletePlayHistory(id);
        showMsg(t('删除成功'));
        loadPlay(keyword.trim(), onlyPlayable, playPage);
    };

    const handleClearPlay = async () => {
        await taskService.clearPlayHistory();
        showMsg(t('清空成功'));
        loadPlay(keyword.trim(), onlyPlayable, 0);
    };

    const handleDeleteSearch = async (name) => {
        await taskService.deleteSearchHistory(name);
        showMsg(t('删除成功'));
        loadSearch(searchPage);
    };

    const handleClearSearch = async () => {
        await taskService.clearSearchHistory();
        showMsg(t('清空成功'));
        loadSearch(0);
    };

    const handlePlayOnDesktop = async (item) => {
        try {
            await taskService.sendPlayRequest(item.name, item.url);
            showMsg(t('已发送到桌面端，请在桌面端确认播放'));
        } catch (e) {
            showMsg(t('发送失败，请确认桌面端与服务端已连接'));
        }
    };

    const playPageCount = Math.max(1, Math.ceil(playTotal / PAGE_SIZE));
    const searchPageCount = Math.max(1, Math.ceil(searchTotal / PAGE_SIZE));

    return (
        <Box style={{ padding: '0 20px' }}>
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message={snackbarMsg} />
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                    <Tab label={t('观看历史')} />
                    <Tab label={t('搜索历史')} />
                </Tabs>
            </Box>

            {tab === 0 ? (
                <Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            label={t('频道名称')}
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                loadPlay(e.target.value.trim(), onlyPlayable, 0);
                            }}
                        />
                        <FormControlLabel
                            control={<Switch size="small" checked={onlyPlayable} onChange={(e) => {
                                setOnlyPlayable(e.target.checked);
                                loadPlay(keyword.trim(), e.target.checked, 0);
                            }} />}
                            label={t('仅可播放')}
                        />
                        <Button variant="outlined" size="small" color="error" onClick={handleClearPlay}>
                            {t('清空')}
                        </Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {t('共')} {playTotal} {t('条记录')}
                    </Typography>
                    <List dense>
                        {playList.map((item) => (
                            <ListItem key={item.id} divider>
                                <ListItemText
                                    primary={item.name}
                                    secondary={(item.playable ? '✓ ' + t('可播放') + ' · ' : '✗ ' + t('不可播放') + ' · ') + item.url + ' · ' + fmtTime(item.last_at) + ' · ' + t('播放') + ' ' + item.count + ' ' + t('次')}
                                    primaryTypographyProps={{ fontSize: 14 }}
                                    secondaryTypographyProps={{ fontSize: 12, noWrap: true }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton size="small" color="primary" onClick={() => handlePlayOnDesktop(item)} title={t('桌面端播放')}>
                                        <PlayCircleOutlineIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDeletePlay(item.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <Pagination
                            count={playPageCount}
                            page={playPage + 1}
                            onChange={(e, v) => loadPlay(keyword.trim(), onlyPlayable, v - 1)}
                            size="small"
                        />
                    </Box>
                </Box>
            ) : (
                <Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('搜索历史说明')}
                        </Typography>
                        <Button variant="outlined" size="small" color="error" onClick={handleClearSearch}>
                            {t('清空')}
                        </Button>
                    </Box>
                    <List dense>
                        {searchList.map((item) => (
                            <ListItem key={item.name} divider>
                                <ListItemText
                                    primary={item.name}
                                    secondary={t('搜索') + ' ' + item.count + ' ' + t('次') + ' · ' + fmtTime(item.last_at)}
                                    primaryTypographyProps={{ fontSize: 14 }}
                                />
                                <ListItemSecondaryAction>
                                    <Chip size="small" label={'x' + item.count} sx={{ mr: 1 }} />
                                    <IconButton size="small" onClick={() => handleDeleteSearch(item.name)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <Pagination
                            count={searchPageCount}
                            page={searchPage + 1}
                            onChange={(e, v) => loadSearch(v - 1)}
                            size="small"
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}
