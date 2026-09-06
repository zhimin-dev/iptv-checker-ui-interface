import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, Card, CardContent, Snackbar, Alert,
    CircularProgress, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Switch, FormControlLabel, Select, MenuItem,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import { ApiTaskService } from '../../services/apiTaskService';

/**
 * AI 整理：
 * 1. 收集 EPG 频道名 + 频道图标统一配置里的名称，以及用户已设置的分组；
 * 2. 发给 DeepSeek：按含义合并名称（EPG 名称变体进 aliases），并把每个频道
 *    分到用户设置的分组里（group1/group2）；
 * 3. 一键合并进频道图标统一配置。
 * DeepSeek API Key 在「设置」页配置；未配置时无法点击「开始 AI 整理」。
 */
export default function AiOrganizePage() {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const [hasKey, setHasKey] = useState(false);
    const [names, setNames] = useState([]);
    const [groups, setGroups] = useState([]);
    const [items, setItems] = useState([]);
    const [organizeErrors, setOrganizeErrors] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [organizing, setOrganizing] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [applying, setApplying] = useState(false);
    const [allowCreate, setAllowCreate] = useState(false);
    // 分组方式：prefix = 前缀/地域，category = 电视分类
    const [groupMode, setGroupMode] = useState('prefix');
    const [message, setMessage] = useState({ open: false, text: '', type: 'info' });

    const showMsg = (text, type) => setMessage({ open: true, text, type });

    useEffect(() => {
        taskService.getAiConfig().then((data) => {
            setHasKey(!!(data && data.api_key && data.api_key.trim()));
        }).catch(() => {});
        // 分组类型与基础设置中的全局设置保持一致
        taskService.getGroupMapping().then((data) => {
            if (data && data.active) setGroupMode(data.active);
        }).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 收集数据：频道图标配置（名称+别名）+ EPG 频道名 + 已检查频道名 + 当前分组类型的分组 */
    const handleCollect = async () => {
        setLoadingData(true);
        try {
            const [icons, epg, mapping, checked] = await Promise.all([
                taskService.getChannelIcons(),
                taskService.getEpgChannelList().catch(() => ({ list: [] })),
                taskService.getGroupMapping().catch(() => ({ groups: [] })),
                taskService.getPlayerChannels('checked', false).catch(() => ({ list: [] })),
            ]);
            // 名称：图标配置项的名称+别名 + EPG 频道名 + 已检查频道名
            const nameSet = new Set();
            (icons.items || []).forEach((it) => {
                if (it.name && it.name.trim()) nameSet.add(it.name.trim());
                (it.aliases || []).forEach((a) => a && a.trim() && nameSet.add(a.trim()));
            });
            (epg.list || []).forEach((c) => {
                if (c.name && c.name.trim()) nameSet.add(c.name.trim());
            });
            (checked.list || []).forEach((c) => {
                if (c.name && c.name.trim()) nameSet.add(c.name.trim());
            });
            setNames(Array.from(nameSet).sort());
            // 分组：只用「分组映射」的扁平分组
            const flat = Array.from(new Set((mapping.groups || []).map((g) => (g || '').trim()).filter(Boolean))).sort();
            setGroups(flat);
            setItems([]);
            setOrganizeErrors([]);
            showMsg(t('aiCollected', { n: nameSet.size, g: flat.length }), 'info');
        } catch (e) {
            showMsg(t('保存失败'), 'error');
        } finally {
            setLoadingData(false);
        }
    };

    const handleOrganize = async () => {
        if (!hasKey) {
            showMsg(t('aiNoKey'), 'warning');
            return;
        }
        if (names.length === 0) {
            showMsg(t('aiNoChannels'), 'warning');
            return;
        }
        setOrganizing(true);
        setItems([]);
        setOrganizeErrors([]);
        // DeepSeek 支持超长上下文：全部名称一次发送
        setElapsed(0);
        const timer = setInterval(() => setElapsed((v) => v + 1), 1000);
        try {
            const data = await taskService.organizeAiChannels(names, groups, allowCreate, groupMode);
            setItems(data.items || []);
            setOrganizeErrors(data.errors || []);
            showMsg(t('aiOrganizeDone', { n: (data.items || []).length }), 'success');
        } catch (e) {
            const msg = (e.response && e.response.data && e.response.data.msg) || e.message || '';
            showMsg(msg || t('aiOrganizeFailed'), 'error');
        } finally {
            clearInterval(timer);
            setOrganizing(false);
        }
    };

    const handleApply = async () => {
        if (items.length === 0) return;
        setApplying(true);
        try {
            const data = await taskService.applyAiChannels(items, allowCreate);
            showMsg(t('aiApplyDone', { u: data.updated || 0, c: data.created || 0, g: data.grouped || 0 }), 'success');
        } catch (e) {
            showMsg(t('保存失败'), 'error');
        } finally {
            setApplying(false);
        }
    };

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Snackbar open={message.open} autoHideDuration={5000} onClose={() => setMessage({ ...message, open: false })}>
                <Alert severity={message.type} sx={{ width: '100%' }}>{message.text}</Alert>
            </Snackbar>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="caption" color="textSecondary">
                    {t('aiOrganizeDesc3')}
                </Typography>

                {!hasKey ? (
                    <Alert severity="warning">{t('aiNoKey')}</Alert>
                ) : null}

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {/* 第一行：分组方式（先选类型再收集） */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                    {t('aiGroupMode')}
                                </Typography>
                                <Select
                                    size="small"
                                    value={groupMode}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setGroupMode(v);
                                        taskService.setActiveGroupType(v).then(() => {
                                            showMsg(t('保存成功'), 'success');
                                            // 切换分组类型后自动重新收集（分组列表与类型相关）
                                            handleCollect();
                                        }).catch(() => {});
                                    }}
                                    sx={{ minWidth: 150 }}
                                >
                                    <MenuItem value="prefix">{t('aiGroupModePrefix')}</MenuItem>
                                    <MenuItem value="category">{t('aiGroupModeCategory')}</MenuItem>
                                </Select>
                            </Box>
                            {/* 第二行：收集 */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button variant="outlined" disabled={loadingData} onClick={handleCollect}>
                                    {loadingData ? <CircularProgress size={16} /> : t('aiCollect')}
                                </Button>
                                <Typography variant="caption" color="textSecondary">
                                    {t('aiCollected', { n: names.length, g: groups.length })}
                                </Typography>
                            </Box>
                            {/* 第三行：可创建分组 */}
                            <FormControlLabel
                                control={
                                    <Switch
                                        size="small"
                                        checked={allowCreate}
                                        onChange={(e) => setAllowCreate(e.target.checked)}
                                    />
                                }
                                label={t('aiAllowCreateGroups')}
                            />
                            <Typography variant="caption" color="textSecondary">
                                {t('aiAllowCreateHint')}
                            </Typography>
                            {/* 最后一行：整理按钮 */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AutoAwesomeIcon />}
                                    disabled={!hasKey || organizing || names.length === 0}
                                    onClick={handleOrganize}
                                >
                                    {organizing ? t('aiOrganizing') : t('aiOrganizeStart')}
                                </Button>
                                {organizing ? <CircularProgress size={18} /> : null}
                                {organizing ? (
                                    <Typography variant="body2" color="primary">
                                        {t('aiOrganizeElapsed', { s: elapsed })}
                                    </Typography>
                                ) : null}
                            </Box>
                        </Box>
                        {organizeErrors.length > 0 ? (
                            <Alert severity="warning" sx={{ mt: 1.5 }}>
                                {organizeErrors.join('；')}
                            </Alert>
                        ) : null}
                        {groups.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                                {groups.map((g) => (
                                    <Chip key={g} size="small" variant="outlined" label={g} />
                                ))}
                            </Box>
                        ) : null}
                    </CardContent>
                </Card>

                {items.length > 0 ? (
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    {t('aiResultTitle')}（{items.length}）
                                </Typography>
                                <Button variant="contained" color="success" disabled={applying} onClick={handleApply}>
                                    {applying ? t('保存中...') : t('aiApply')}
                                </Button>
                            </Box>
                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 520 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('频道名称')}</TableCell>
                                            <TableCell>{t('别名')}</TableCell>
                                            <TableCell>tvg-id</TableCell>
                                            <TableCell>{t('分组')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((it, i) => (
                                            <TableRow key={i}>
                                                <TableCell sx={{ fontWeight: 500 }}>{it.name}</TableCell>
                                                <TableCell sx={{ maxWidth: 300 }}>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {(it.aliases || []).join(', ')}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{it.tvg_id || '-'}</TableCell>
                                                <TableCell>{it.group || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                ) : null}
            </Box>
        </Box>
    );
}
