import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import Pagination from '@mui/material/Pagination';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from "react-i18next";
import { ApiTaskService } from '../../services/apiTaskService';

/**
 * 定时检查配置：检查源黑名单（失败阈值 / 自动清理天数 / 列表 / 一键清理）
 */
export default function CheckSettings() {
    const { t } = useTranslation();
    const taskService = new ApiTaskService();
    const PAGE_SIZE = 20;
    const [list, setList] = useState([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [failTimes, setFailTimes] = useState(5);
    const [autoCleanDays, setAutoCleanDays] = useState(7);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [reports, setReports] = useState([]);

    /** 加载最近的检测报告（按格式统计） */
    const loadReports = async () => {
        try {
            const data = await taskService.getCheckReports();
            setReports(data.list || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showMsg = (msg) => {
        setSnackbarMsg(msg);
        setOpenSnackbar(true);
    };

    const load = async (p) => {
        const pg = p === undefined ? page : p;
        try {
            const data = await taskService.getBlacklist(pg, PAGE_SIZE);
            setList(data.list || []);
            setTotal(data.total || 0);
            setPage(data.page ?? pg);
            if (typeof data.fail_times === 'number') setFailTimes(data.fail_times);
            if (typeof data.auto_clean_days === 'number') setAutoCleanDays(data.auto_clean_days);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        load(0);
    }, []);

    const handlePageChange = (e, v) => {
        const pg = Math.max(0, (v || 1) - 1);
        setPage(pg);
        load(pg);
    };

    const handleSaveConfig = async () => {
        try {
            await taskService.setBlacklistConfig({
                fail_times: Math.max(1, Number(failTimes) || 5),
                auto_clean_days: Math.max(1, Number(autoCleanDays) || 7),
            });
            showMsg(t('保存成功'));
            load();
        } catch (e) {
            showMsg(t('保存失败'));
        }
    };

    const handleClear = async () => {
        try {
            await taskService.clearBlacklist();
            showMsg(t('清空成功'));
            setPage(0);
            load(0);
        } catch (e) {
            showMsg(t('清空失败'));
        }
    };

    const fmtTime = (secs) => (secs ? new Date(secs * 1000).toLocaleString() : '-');

    const reportRows = [
        { label: t('总数'), key: 'total' },
        { label: 'm3u8', key: 'm3u8_total' },
        { label: t('无效m3u8'), key: 'm3u8_invalid' },
        { label: 'rtmp', key: 'rtmp' },
        { label: 'rtsp', key: 'rtsp' },
        { label: 'flv', key: 'flv' },
        { label: 'ts', key: 'ts' },
        { label: 'mp4', key: 'mp4' },
        { label: t('其他'), key: 'other' },
        { label: t('成功'), key: 'success' },
        { label: t('失败'), key: 'failed' },
    ];

    return (
        <Box style={{ padding: '0 20px', width: '100%', maxWidth: '900px' }}>
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)} message={snackbarMsg} />

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {t('检查源黑名单')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('黑名单说明')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            type="number"
                            label={t('失败次数阈值')}
                            value={failTimes}
                            onChange={(e) => setFailTimes(e.target.value)}
                            sx={{ width: 160 }}
                        />
                        <TextField
                            size="small"
                            type="number"
                            label={t('自动清理天数')}
                            value={autoCleanDays}
                            onChange={(e) => setAutoCleanDays(e.target.value)}
                            sx={{ width: 160 }}
                        />
                        <Button variant="contained" size="small" onClick={handleSaveConfig}>
                            {t('保存配置')}
                        </Button>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button variant="outlined" size="small" color="error" onClick={handleClear}>
                            {t('一键清理')}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {t('黑名单列表')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            {t('共')} {total} {t('条记录')}
                        </Typography>
                    </Box>
                    <List dense>
                        {list.map((item) => (
                            <ListItem key={item.url} divider>
                                <ListItemText
                                    primary={item.url}
                                    secondary={t('失败') + ' ' + item.fail_count + ' ' + t('次') + ' · ' + fmtTime(item.last_fail_at)}
                                    primaryTypographyProps={{ fontSize: 13, noWrap: true }}
                                />
                                {item.blacklisted ? (
                                    <Chip size="small" color="error" label={t('已拉黑')} />
                                ) : (
                                    <Chip size="small" label={t('累计中')} />
                                )}
                            </ListItem>
                        ))}
                    </List>
                    {total > PAGE_SIZE ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                            <Pagination
                                count={Math.ceil(total / PAGE_SIZE)}
                                page={page + 1}
                                onChange={handlePageChange}
                                size="small"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    ) : null}
                </CardContent>
            </Card>

            {/* 检测报告：每次定时检查完成后按格式统计 */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {t('检测报告')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {t('检测报告说明')}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button variant="outlined" size="small" startIcon={<RefreshIcon fontSize="small" />} onClick={loadReports}>
                            {t('刷新列表')}
                        </Button>
                    </Box>
                    {reports.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                            {t('暂无数据')}
                        </Typography>
                    ) : (
                        <TableContainer sx={{ maxHeight: 420 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('生成时间')}</TableCell>
                                        {reportRows.map((r) => (
                                            <TableCell key={r.key} align="right">{r.label}</TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.map((item, idx) => (
                                        <TableRow key={item.file || idx} hover>
                                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                                {fmtTime(item.generated_at)}
                                            </TableCell>
                                            {reportRows.map((r) => (
                                                <TableCell key={r.key} align="right">
                                                    {item[r.key] ?? 0}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
