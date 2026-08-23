import React, { useEffect, useState } from 'react';
import {
    Box, Button, TextField, Typography, Card, Snackbar, CircularProgress, Alert, Pagination,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ApiTaskService } from '../../services/apiTaskService';

/**
 * 爬取的频道封面整理区（自包含组件）：
 * 展示爬取到的台标、手动触发爬取、绑定到频道名、清空。
 * onBound: 绑定成功后回调（例如刷新正式封面配置列表）。
 */
export default function CrawledLogosPanel({ onBound }) {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const PAGE_SIZE = 24;
    const [crawledLogos, setCrawledLogos] = useState([]);
    const [page, setPage] = useState(0);
    const [crawling, setCrawling] = useState(false);
    const [selectedLogoIds, setSelectedLogoIds] = useState(new Set());
    const [bindNames, setBindNames] = useState('');
    const [msg, setMsg] = useState({ open: false, text: '', type: 'info' });

    const pagedLogos = crawledLogos.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const showMsg = (text, type) => setMsg({ open: true, text, type });

    const fetchCrawledLogos = async () => {
        try {
            const data = await taskService.getCrawledLogos();
            setCrawledLogos(data.list || []);
            setPage(0);
        } catch (e) {
            console.error('Error fetching crawled logos:', e);
        }
    };

    useEffect(() => {
        fetchCrawledLogos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        if (selectedLogoIds.size === 0) {
            showMsg(t('请先选择封面'), 'warning');
            return;
        }
        // 未输入频道名时传空数组，服务端自动使用每个封面爬取时记录的频道名
        const names = bindNames.split(/[,，\s]+/).map((n) => n.trim()).filter(Boolean);
        try {
            await taskService.bindCrawledLogos(Array.from(selectedLogoIds), names);
            setSelectedLogoIds(new Set());
            setBindNames('');
            showMsg(t('绑定成功'), 'success');
            fetchCrawledLogos();
            if (onBound) onBound();
        } catch (e) {
            showMsg(t('绑定失败'), 'error');
        }
    };

    /** 手动触发台标爬取：从当前频道列表下载 logo（文件名带频道名标注） */
    const handleCrawlLogos = async () => {
        setCrawling(true);
        try {
            await taskService.crawlLogos();
            showMsg(t('爬取完成'), 'success');
            fetchCrawledLogos();
        } catch (e) {
            showMsg(t('爬取失败'), 'error');
        } finally {
            setCrawling(false);
        }
    };

    const handleClearCrawled = async () => {
        try {
            await taskService.clearCrawledLogos();
            setSelectedLogoIds(new Set());
            showMsg(t('清空成功'), 'success');
            fetchCrawledLogos();
        } catch (e) {
            showMsg(t('清空失败'), 'error');
        }
    };

    return (
        <Card sx={{ mb: 3, p: 2 }}>
            <Snackbar
                open={msg.open}
                autoHideDuration={3000}
                onClose={() => setMsg({ ...msg, open: false })}
            >
                <Alert severity={msg.type} sx={{ width: '100%' }}>
                    {msg.text}
                </Alert>
            </Snackbar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {t('爬取的封面')}（{crawledLogos.length}）
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        {t('爬取封面说明')}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={crawling ? <CircularProgress size={14} color="inherit" /> : null}
                        disabled={crawling}
                        onClick={handleCrawlLogos}
                    >
                        {crawling ? t('正在爬取...') : t('立即爬取台标')}
                    </Button>
                    <Button variant="outlined" size="small" color="error" onClick={handleClearCrawled} disabled={crawledLogos.length === 0}>
                        {t('清空')}
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        label={t('绑定到频道名（可选）')}
                        placeholder={t('留空自动使用爬取时的频道名，也可手动指定（逗号分隔）')}
                        value={bindNames}
                        onChange={(e) => setBindNames(e.target.value)}
                        sx={{ minWidth: 320, flexGrow: 1 }}
                        helperText={t('绑定自动说明')}
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
                {crawledLogos.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                        {t('爬取封面空说明')}
                    </Typography>
                ) : null}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {pagedLogos.map((item) => (
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
                {crawledLogos.length > PAGE_SIZE ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                        <Pagination
                            count={Math.ceil(crawledLogos.length / PAGE_SIZE)}
                            page={page + 1}
                            onChange={(e, v) => setPage((v || 1) - 1)}
                            size="small"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                ) : null}
            </Box>
        </Card>
    );
}
