import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import StopIcon from '@mui/icons-material/Stop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from "react-i18next";
import { ApiTaskService } from '../../services/apiTaskService';

/**
 * 流畅模式（服务器中继）记录列表：
 * - 可手动停止不再观看的会话
 * - 可复制加速播放链接，粘贴到其他播放器使用
 */
export default function RelayPage() {
    const { t } = useTranslation();
    const taskService = new ApiTaskService();
    const [list, setList] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [copiedSid, setCopiedSid] = useState('');
    const [m3u8Url, setM3u8Url] = useState('');
    const [starting, setStarting] = useState(false);
    const [resultUrl, setResultUrl] = useState('');
    const [resultName, setResultName] = useState('');
    const [copiedResult, setCopiedResult] = useState(false);
    // 分片参数（服务端配置，桌面端启用流畅模式时使用）
    const [hlsTime, setHlsTime] = useState('4');
    const [keepSegments, setKeepSegments] = useState('30');
    const [savingConfig, setSavingConfig] = useState(false);

    const showMsg = (msg) => {
        setSnackbarMsg(msg);
        setOpenSnackbar(true);
    };

    const load = async () => {
        try {
            const data = await taskService.getRelayList();
            setList(data.list || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        load();
        // 每 10 秒自动刷新
        const timer = setInterval(load, 10000);
        return () => clearInterval(timer);
    }, []);

    // 读取服务端分片配置
    useEffect(() => {
        taskService
            .getRelayConfig()
            .then((d) => {
                if (d && typeof d.hls_time === 'number') setHlsTime(String(d.hls_time));
                if (d && typeof d.keep_segments === 'number') setKeepSegments(String(d.keep_segments));
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveConfig = async () => {
        setSavingConfig(true);
        try {
            await taskService.setRelayConfig({
                hls_time: Number(hlsTime) || 4,
                keep_segments: Number(keepSegments) || 30,
            });
            showMsg(t('保存成功'));
        } catch (e) {
            showMsg(t('保存失败'));
        } finally {
            setSavingConfig(false);
        }
    };

    /** 输入 m3u8 链接启动流畅模式，返回加速地址 */
    const handleStart = async () => {
        const url = m3u8Url.trim();
        if (!/^https?:\/\//i.test(url)) {
            showMsg(t('请输入有效的m3u8地址'));
            return;
        }
        setStarting(true);
        try {
            const data = await taskService.startRelay(url);
            if (data && data.playlist_url) {
                const full = window.document.location.origin + data.playlist_url;
                setResultUrl(full);
                setResultName(url);
                setCopiedResult(false);
                setM3u8Url('');
                load();
            } else {
                showMsg(t('启动失败') + (data?.msg ? '：' + data.msg : ''));
            }
        } catch (e) {
            const msg = (e?.response?.data?.msg) || e?.message || '';
            showMsg(t('启动失败') + (msg ? '：' + msg : ''));
        } finally {
            setStarting(false);
        }
    };

    const handleCopyResult = async () => {
        try {
            await navigator.clipboard.writeText(resultUrl);
            setCopiedResult(true);
            setTimeout(() => setCopiedResult(false), 1500);
            showMsg(t('复制成功'));
        } catch (e) {
            showMsg(t('复制失败'));
        }
    };

    const handleStop = async (sid) => {
        try {
            await taskService.stopRelay(sid);
            showMsg(t('已停止'));
            load();
        } catch (e) {
            showMsg(t('保存失败'));
        }
    };

    const handleCopy = async (sid, playlistUrl) => {
        const full = window.document.location.origin + playlistUrl;
        try {
            await navigator.clipboard.writeText(full);
            setCopiedSid(sid);
            setTimeout(() => setCopiedSid(''), 1500);
            showMsg(t('复制成功'));
        } catch (e) {
            showMsg(t('复制失败'));
        }
    };

    const fmtTime = (secs) => (secs ? new Date(secs * 1000).toLocaleString() : '-');

    return (
        <Box style={{ padding: '0 20px', width: '100%' }}>
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message={snackbarMsg} />
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    label={t('添加m3u8链接')}
                    placeholder="http://example.com/live/playlist.m3u8"
                    value={m3u8Url}
                    onChange={(e) => setM3u8Url(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleStart();
                    }}
                    sx={{ minWidth: 420, flexGrow: 1 }}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                />
                <Button
                    variant="contained"
                    size="medium"
                    startIcon={starting ? <CircularProgress size={16} color="inherit" /> : <PlayCircleOutlineIcon />}
                    disabled={starting || !m3u8Url.trim()}
                    onClick={handleStart}
                >
                    {t('启动流畅模式')}
                </Button>
            </Box>

            {/* 分片参数配置：桌面端不再下发参数，统一由后台配置 */}
            <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    {t('流畅模式分片配置')}
                </Typography>
                <TextField
                    size="small"
                    type="number"
                    label={t('分片时长')}
                    value={hlsTime}
                    onChange={(e) => setHlsTime(e.target.value)}
                    inputProps={{ min: 2, max: 30 }}
                    sx={{ width: 150 }}
                />
                <TextField
                    size="small"
                    type="number"
                    label={t('保留分片数')}
                    value={keepSegments}
                    onChange={(e) => setKeepSegments(e.target.value)}
                    inputProps={{ min: 3, max: 60 }}
                    sx={{ width: 150 }}
                />
                <Button
                    variant="contained"
                    size="small"
                    disabled={savingConfig}
                    onClick={handleSaveConfig}
                >
                    {t('保存')}
                </Button>
                <Typography variant="caption" color="textSecondary">
                    {t('分片配置说明')}
                </Typography>
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6">{t('流畅模式记录')}</Typography>
                <Typography variant="caption" color="textSecondary">
                    {t('流畅模式说明')}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={load}>
                    {t('刷新列表')}
                </Button>
            </Box>
            {list.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    {t('暂无数据')}
                </Typography>
            ) : (
                <Paper sx={{ overflow: 'hidden' }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('源地址')}</TableCell>
                                    <TableCell>{t('类型')}</TableCell>
                                    <TableCell>{t('状态')}</TableCell>
                                    <TableCell>{t('分片数')}</TableCell>
                                    <TableCell>{t('延迟')}</TableCell>
                                    <TableCell>{t('开始时间')}</TableCell>
                                    <TableCell>{t('加速播放链接')}</TableCell>
                                    <TableCell>{t('操作')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {list.map((item) => (
                                    <TableRow key={item.sid}>
                                        <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.url}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                {item.manual ? (
                                                    <Chip size="small" variant="outlined" label={t('手动添加')} />
                                                ) : (
                                                    <Chip size="small" variant="outlined" color="primary" label={t('桌面播放')} />
                                                )}
                                                <Typography variant="caption" color="textSecondary">
                                                    {item.engine === 'http' ? 'HTTP 直传' : item.engine === 'ffmpeg' ? 'ffmpeg 转码' : item.engine || '-'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {item.alive ? (
                                                    <Chip size="small" color="success" label={t('运行中')} />
                                                ) : (
                                                    <Chip size="small" color="error" label={t('已停止')} />
                                                )}
                                                {!item.manual && typeof item.heartbeat_secs === 'number' ? (
                                                    <Typography
                                                        variant="caption"
                                                        color={item.heartbeat_secs > 45 ? 'warning.main' : 'textSecondary'}
                                                    >
                                                        {t('心跳')} {item.heartbeat_secs}s
                                                    </Typography>
                                                ) : null}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{item.segment_count}</TableCell>
                                        <TableCell>{t('约')} {item.hls_time * item.keep_segments} {t('秒')}</TableCell>
                                        <TableCell>{fmtTime(item.started_at)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: 260 }}>
                                                <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {window.document.location.origin + item.playlist_url}
                                                </Typography>
                                                <IconButton size="small" onClick={() => handleCopy(item.sid, item.playlist_url)} title={t('复制订阅地址')}>
                                                    {copiedSid === item.sid ? (
                                                        <Typography variant="caption" color="success.main">{t('复制成功')}</Typography>
                                                    ) : (
                                                        <ContentCopyIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="error" onClick={() => handleStop(item.sid)} title={t('停止')}>
                                                <StopIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* 加速地址结果弹窗 */}
            <Dialog open={!!resultUrl} onClose={() => setResultUrl('')} maxWidth="sm" fullWidth>
                <DialogTitle>{t('加速地址已生成')}</DialogTitle>
                <DialogContent>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                        {t('源地址')}：{resultName}
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={resultUrl}
                        InputProps={{ readOnly: true }}
                        helperText={t('加速地址说明')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResultUrl('')}>{t('关闭')}</Button>
                    <Button variant="contained" onClick={handleCopyResult}>
                        {copiedResult ? t('复制成功') : t('复制订阅地址')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
