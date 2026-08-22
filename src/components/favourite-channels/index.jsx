import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Pagination from '@mui/material/Pagination';
import Snackbar from '@mui/material/Snackbar';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useTranslation } from "react-i18next";
import { ApiTaskService } from '../../services/apiTaskService';

const PAGE_SIZE = 20;

/**
 * 收藏的频道（播放器收藏）：独立菜单展示，支持分页与桌面端播放推送
 */
export default function FavouriteChannelsPage() {
    const { t } = useTranslation();
    const taskService = new ApiTaskService();
    const [list, setList] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [copied, setCopied] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');

    const showMsg = (msg) => {
        setSnackbarMsg(msg);
        setOpenSnackbar(true);
    };

    const load = async (p) => {
        try {
            const d = await taskService.getFavouriteChannels(p);
            setList(d.list || []);
            setTotal(d.total || 0);
            setPage(d.page || 0);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        load(0);
    }, []);

    const handleRemove = async (id) => {
        try {
            await taskService.removeFavouriteChannel(id);
            showMsg(t('删除成功'));
            load(page);
        } catch (e) {
            showMsg(t('保存失败'));
        }
    };

    const handlePlayOnDesktop = async (item) => {
        try {
            await taskService.sendPlayRequest(item.name, item.url);
            showMsg(t('已发送到桌面端，请在桌面端确认播放'));
        } catch (e) {
            showMsg(t('发送失败，请确认桌面端与服务端已连接'));
        }
    };

    const subscribeUrl = window.document.location.origin + '/api/player/favourites.m3u8';

    const handleCopySubscribe = async () => {
        try {
            await navigator.clipboard.writeText(subscribeUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            // 忽略
        }
    };

    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <Box style={{ padding: '0 20px', width: '100%', maxWidth: '900px' }}>
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message={snackbarMsg} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="h6">{t('收藏的频道')}（{total}）</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Typography
                    variant="caption"
                    component="span"
                    sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline', maxWidth: 420, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={subscribeUrl}
                >
                    {subscribeUrl}
                </Typography>
                <Button size="small" variant="outlined" onClick={handleCopySubscribe}>
                    {copied ? t('复制成功') : t('复制订阅地址')}
                </Button>
            </Box>
            {list.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    {t('暂无数据')}
                </Typography>
            ) : (
                <Card>
                    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <List dense>
                            {list.map((c) => (
                                <ListItem key={c.id} divider>
                                    <ListItemText
                                        primary={c.name}
                                        secondary={c.url}
                                        primaryTypographyProps={{ fontSize: 14 }}
                                        secondaryTypographyProps={{ fontSize: 12, noWrap: true }}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton size="small" color="primary" onClick={() => handlePlayOnDesktop(c)} title={t('桌面端播放')}>
                                            <PlayCircleOutlineIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleRemove(c.id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Pagination
                    count={pageCount}
                    page={page + 1}
                    onChange={(e, v) => load(v - 1)}
                    size="small"
                />
            </Box>
        </Box>
    );
}
