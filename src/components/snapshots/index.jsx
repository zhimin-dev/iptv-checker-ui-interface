import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { useTranslation } from "react-i18next";
import { ApiTaskService } from '../../services/apiTaskService';

/**
 * 频道画面（快照）调试页：
 * - 展示后台「显示频道画面」开关状态
 * - 批量/单个抓取已检查频道的实时画面，方便定位哪些源抓不到帧
 */
export default function SnapshotsPage() {
    const { t } = useTranslation();
    const taskService = new ApiTaskService();
    const PAGE_SIZE = 24;
    const [enabled, setEnabled] = useState(false);
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [batchLoading, setBatchLoading] = useState(false);
    const [version, setVersion] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    // 当前 tab：checked = 已检查频道，fav = 收藏的频道
    const [tab, setTab] = useState('checked');
    // 当前页展示的频道
    const pagedItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    // 每 30 秒重渲染一次，更新「画面多久之前」角标（与 player 展示逻辑一致）
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick((v) => v + 1), 30000);
        return () => clearInterval(timer);
    }, []);
    // 引用 tick 避免 lint 未使用告警，同时作为角标重算的触发点
    void tick;

    /** 把抓帧时间格式化为「刚刚 / X秒前 / X分钟前 / X小时前」（与 player 一致） */
    const fmtSnapAge = (ts) => {
        if (!ts) return '';
        const diff = Math.max(0, Math.floor(Date.now() / 1000) - ts);
        if (diff < 5) return t('snapAgeNow');
        if (diff < 60) return t('snapAgeSec', { s: diff });
        if (diff < 3600) return t('snapAgeMin', { m: Math.floor(diff / 60) });
        return t('snapAgeHour', { h: Math.floor(diff / 3600) });
    };

    const showMsg = (msg) => {
        setSnackbarMsg(msg);
        setOpenSnackbar(true);
    };

    const loadConfig = async () => {
        try {
            const d = await taskService.getSnapshotsConfig();
            setEnabled(!!(d && d.enabled));
        } catch (e) {
            console.error(e);
        }
    };

    /** 加载频道列表（最多 200 个），按当前 tab 选择已检查 / 收藏，返回列表 */
    const loadChannels = async (which) => {
        try {
            let list = [];
            if (which === 'fav') {
                const d = await taskService.getFavouriteChannels(0, 200);
                list = (d.list || []).slice(0, 200).map((c) => ({ name: c.name, url: c.url }));
            } else {
                const d = await taskService.getPlayerChannels('checked', false);
                list = (d.list || []).slice(0, 200).map((c) => ({ ...c }));
            }
            setItems(list);
            setPage(0);
            return list;
        } catch (e) {
            console.error(e);
            showMsg(t('加载失败'));
            return [];
        }
    };

    /** 分块请求画面（服务端单次最多 60 个源），返回 url -> 结果 */
    const fetchSnapshots = async (channelItems, refresh, existingOnly) => {
        const CHUNK = 48;
        const map = {};
        for (let i = 0; i < channelItems.length; i += CHUNK) {
            const urls = channelItems.slice(i, i + CHUNK).map((c) => c.url);
            const d = await taskService.getSnapshots(urls, refresh, existingOnly);
            (d.list || []).forEach((item) => {
                map[item.url] = {
                    ok: item.ok,
                    snapshot: item.ok && item.snapshot ? item.snapshot : '',
                    captured_at: item.captured_at || 0,
                };
            });
        }
        return map;
    };

    /** 把抓帧结果合并进列表 */
    const applyMap = (map) => {
        setItems((prev) =>
            prev.map((c) => {
                const r = map[c.url];
                return r ? { ...c, ok: r.ok, snapshot: r.snapshot || '', captured_at: r.captured_at || 0 } : c;
            })
        );
        setVersion((v) => v + 1);
    };

    const handleRefreshAll = async () => {
        if (items.length === 0) {
            showMsg(t('暂无可抓取的频道'));
            return;
        }
        setBatchLoading(true);
        try {
            const map = await fetchSnapshots(items, true, false);
            applyMap(map);
            showMsg(t('刷新画面完成'));
        } catch (e) {
            showMsg(t('刷新失败'));
        } finally {
            setBatchLoading(false);
        }
    };

    const handleRefreshOne = async (item) => {
        setItems((prev) => prev.map((c) => (c.url === item.url ? { ...c, _loading: true } : c)));
        try {
            const map = await fetchSnapshots([item], true, false);
            const r = map[item.url];
            setItems((prev) =>
                prev.map((c) =>
                    c.url === item.url ? { ...c, ok: r && r.ok, snapshot: (r && r.snapshot) || '', _loading: false } : c
                )
            );
            setVersion((v) => v + 1);
        } catch (e) {
            setItems((prev) => prev.map((c) => (c.url === item.url ? { ...c, _loading: false } : c)));
            showMsg(t('刷新失败'));
        }
    };

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            try {
                await loadConfig();
                const list = await loadChannels(tab);
                if (cancelled || list.length === 0) {
                    setLoading(false);
                    return;
                }
                // 先展示服务端已有的画面（existing_only：不抓帧，瞬间返回），
                // 拿到已有画面后立刻渲染网格，不等待后面的后台补抓
                let existing = {};
                try {
                    existing = await fetchSnapshots(list, false, true);
                    applyMap(existing);
                } catch (e) {
                    console.error(e);
                }
                setLoading(false);
                // 后台补抓还没有画面的频道（最多 48 个，不阻塞页面展示）
                const missing = list
                    .filter((c) => !(existing[c.url] && existing[c.url].snapshot))
                    .slice(0, 48);
                if (missing.length > 0) {
                    try {
                        const fresh = await fetchSnapshots(missing, false, false);
                        applyMap(fresh);
                    } catch (e) {
                        console.error(e);
                    }
                }
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    return (
        <Box style={{ padding: '0 20px', width: '100%' }}>
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message={snackbarMsg} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ minHeight: 0 }}>
                    <Tab value="checked" label={t('已检查频道')} sx={{ minHeight: 0, py: 0.5 }} />
                    <Tab value="fav" label={t('收藏的频道')} sx={{ minHeight: 0, py: 0.5 }} />
                </Tabs>
                <FormControlLabel
                    control={
                        <Switch
                            size="small"
                            checked={enabled}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setEnabled(checked);
                                taskService.setSnapshotsConfig(checked).catch(() => {});
                            }}
                        />
                    }
                    label={t('显示频道画面')}
                />
                <Typography variant="caption" color="textSecondary">
                    {t('频道画面说明')}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                    variant="contained"
                    size="small"
                    startIcon={batchLoading ? <CircularProgress size={14} color="inherit" /> : <PlayCircleOutlineIcon />}
                    disabled={batchLoading || items.length === 0}
                    onClick={handleRefreshAll}
                >
                    {t('抓取全部画面')}
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : items.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                    {t('暂无数据')}
                </Typography>
            ) : (
                <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {pagedItems.map((c) => (
                            <Box key={c.url} sx={{ width: 240, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: '100%',
                                        height: 135,
                                        bgcolor: '#0d0d0d',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {/* 右上角：最后一次更新时间 */}
                                    {c.snapshot && c.captured_at ? (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                bgcolor: 'rgba(0,0,0,0.68)',
                                                color: '#fff',
                                                fontSize: 10,
                                                lineHeight: 1.4,
                                                px: 0.8,
                                                py: 0.2,
                                                borderRadius: '4px',
                                                zIndex: 2,
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            {fmtSnapAge(c.captured_at)}
                                        </Box>
                                    ) : null}
                                    {c._loading ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : c.snapshot ? (
                                        <img
                                            src={c.snapshot + '?v=' + version}
                                            alt={c.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <Typography variant="caption" color={c.ok ? 'success.main' : 'grey.500'}>
                                            {c.ok === false ? t('抓帧失败') : t('未抓帧')}
                                        </Typography>
                                    )}
                                </Box>
                                <Typography variant="caption" noWrap title={c.name}>
                                    {c.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" noWrap title={c.url} sx={{ fontSize: 10 }}>
                                    {c.url}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<RefreshIcon fontSize="small" />}
                                    onClick={() => handleRefreshOne(c)}
                                    disabled={c._loading}
                                >
                                    {t('刷新')}
                                </Button>
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
                </Paper>
            )}
        </Box>
    );
}
