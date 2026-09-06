import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from "react-i18next";
import { ApiTaskService } from '../../services/apiTaskService';

export default function GroupMappingSettings() {
    const { t } = useTranslation();
    const [taskService] = useState(() => new ApiTaskService());
    const [groups, setGroups] = useState([]);
    const [mapping, setMapping] = useState({});
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [newGroupName, setNewGroupName] = useState('');
    const [newChannelName, setNewChannelName] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    const [saving, setSaving] = useState(false);
    // 当前分组类型：prefix 前缀/地域 | category 电视分类
    const [activeType, setActiveType] = useState('prefix');
    // 重命名分组弹窗
    const [renameOpen, setRenameOpen] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    // 频道名/别名/tvg-id -> 图标地址（来自统一频道图标配置）
    const [iconMap, setIconMap] = useState({});

    useEffect(() => {
        fetchData();
        // 加载频道图标映射（主名称/别名/tvg-id 小写 -> logo）
        taskService.getChannelIcons().then((data) => {
            const map = {};
            (data.items || []).forEach((it) => {
                const logo = it.logo || '';
                if (!logo) return;
                const keys = [it.name, ...(it.aliases || []), it.tvg_id].filter(Boolean);
                keys.forEach((k) => {
                    const key = k.trim().toLowerCase();
                    if (key && !map[key]) map[key] = logo;
                });
            });
            setIconMap(map);
        }).catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 按频道名（或 EPG ID）查图标地址 */
    const logoOf = (name) => iconMap[(name || '').trim().toLowerCase()] || '';

    const fetchData = async () => {
        try {
            const data = await taskService.getGroupMapping();
            setGroups(data.groups || []);
            setMapping(data.mapping || {});
            setActiveType(data.active || 'prefix');
        } catch (e) {
            console.error('Failed to fetch group mappings:', e);
        }
    };

    const saveToServer = async (newGroups, newMapping) => {
        setSaving(true);
        try {
            await taskService.saveGroupMapping({ groups: newGroups, mapping: newMapping });
            setGroups(newGroups);
            setMapping(newMapping);
            setSnackbarMsg(t('已保存'));
            setOpenSnackbar(true);
        } catch (e) {
            setSnackbarMsg(t('保存失败'));
            setOpenSnackbar(true);
        } finally {
            setSaving(false);
        }
    };

    const handleAddGroup = async () => {
        const name = newGroupName.trim();
        if (!name) return;
        if (groups.includes(name)) {
            setSnackbarMsg(t('分组已存在'));
            setOpenSnackbar(true);
            return;
        }
        const newGroups = [...groups, name].sort();
        await saveToServer(newGroups, mapping);
        setSelectedGroup(name);
        setNewGroupName('');
    };

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;
        const newGroups = groups.filter(g => g !== selectedGroup);
        const newMapping = {};
        for (const [k, v] of Object.entries(mapping)) {
            if (v !== selectedGroup) newMapping[k] = v;
        }
        await saveToServer(newGroups, newMapping);
        setSelectedGroup(null);
    };

    const openRename = () => {
        if (!selectedGroup) return;
        setRenameValue(selectedGroup);
        setRenameOpen(true);
    };

    /** 重命名分组：同步更新分组列表与映射中的分组名 */
    const handleRename = async () => {
        const name = renameValue.trim();
        if (!name || !selectedGroup) return;
        if (name === selectedGroup) {
            setRenameOpen(false);
            return;
        }
        if (groups.some((g) => g === name)) {
            setSnackbarMsg(t('分组已存在'));
            setOpenSnackbar(true);
            return;
        }
        const newGroups = groups.map((g) => (g === selectedGroup ? name : g));
        const newMapping = {};
        for (const [k, v] of Object.entries(mapping)) {
            newMapping[k] = v === selectedGroup ? name : v;
        }
        setSaving(true);
        try {
            await taskService.saveGroupMapping({ groups: newGroups, mapping: newMapping });
            setGroups(newGroups);
            setMapping(newMapping);
            setSelectedGroup(name);
            setRenameOpen(false);
            setSnackbarMsg(t('已保存'));
            setOpenSnackbar(true);
        } catch (e) {
            setSnackbarMsg(t('保存失败'));
            setOpenSnackbar(true);
        } finally {
            setSaving(false);
        }
    };

    const handleAddChannel = async () => {
        const name = newChannelName.trim();
        if (!name || !selectedGroup) return;
        if (mapping[name]) {
            setSnackbarMsg(t('该频道已在分组') + ' ' + mapping[name] + ' ' + t('中'));
            setOpenSnackbar(true);
            return;
        }
        const newMapping = { ...mapping, [name]: selectedGroup };
        await saveToServer(groups, newMapping);
        setNewChannelName('');
    };

    const handleDeleteChannel = async (tvName) => {
        const newMapping = { ...mapping };
        delete newMapping[tvName];
        await saveToServer(groups, newMapping);
    };

    const channelsForGroup = (() => {
        if (!selectedGroup) return [];
        return Object.entries(mapping)
            .filter(([, g]) => g === selectedGroup)
            .map(([tvName]) => tvName)
            .sort();
    })();

    return (
        <Box style={{ padding: '0 20px', width: '100%', maxWidth: '1000px' }}>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                message={snackbarMsg}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                    {t('aiGroupMode')}
                </Typography>
                <Select
                    size="small"
                    value={activeType}
                    onChange={(e) => {
                        const v = e.target.value;
                        setActiveType(v);
                        taskService.setActiveGroupType(v).then(() => {
                            fetchData();
                        }).catch(() => {});
                    }}
                    sx={{ minWidth: 150 }}
                >
                    <MenuItem value="prefix">{t('aiGroupModePrefix')}</MenuItem>
                    <MenuItem value="category">{t('aiGroupModeCategory')}</MenuItem>
                </Select>
                {saving ? <CircularProgress size={18} /> : null}
            </Box>

            {/* 新增分组 */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    <TextField
                        label={t('新增分组名称')}
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        size="small"
                        sx={{ width: 260 }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddGroup}>
                        {t('新增分组')}
                    </Button>
                </Box>
            </Paper>

            {/* 主体：左侧分组列表 + 右侧频道列表 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Paper sx={{ width: 220, flexShrink: 0 }}>
                    <Box sx={{ p: 1.5, fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                        {t('分组列表')} ({groups.length})
                    </Box>
                    <List dense sx={{ maxHeight: 500, overflow: 'auto' }}>
                        {groups.map((g) => (
                            <ListItemButton
                                key={g}
                                selected={selectedGroup === g}
                                onClick={() => setSelectedGroup(g)}
                            >
                                <ListItemText primary={g} />
                            </ListItemButton>
                        ))}
                        {groups.length === 0 && (
                            <Box sx={{ p: 2, color: 'text.secondary', fontSize: '14px' }}>
                                {t('暂无分组')}
                            </Box>
                        )}
                    </List>
                </Paper>

                <Paper sx={{ flex: 1, p: 2 }}>
                    {!selectedGroup ? (
                        <Box sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
                            {t('请从左侧选择一个分组')}
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1">
                                    {selectedGroup} ({channelsForGroup.length})
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button size="small" startIcon={<EditIcon />} onClick={openRename}>
                                        {t('重命名')}
                                    </Button>
                                    <Button color="error" size="small" onClick={handleDeleteGroup}>
                                        {t('删除分组')}
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-end' }}>
                                <TextField
                                    label={t('频道名 (tvg-name)')}
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    size="small"
                                    sx={{ flex: 1 }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
                                />
                                <Button variant="contained" size="small" onClick={handleAddChannel}>
                                    {t('添加')}
                                </Button>
                            </Box>

                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width={88}>{t('图标')}</TableCell>
                                            <TableCell>{t('频道名')}</TableCell>
                                            <TableCell width={80}>{t('操作')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {channelsForGroup.map((name) => (
                                            <TableRow key={name}>
                                                <TableCell>
                                                    {logoOf(name) ? (
                                                        <Box
                                                            component="img"
                                                            src={logoOf(name)}
                                                            alt={name}
                                                            sx={{ width: 56, height: 40, objectFit: 'contain', display: 'block', bgcolor: '#f5f5f5', borderRadius: 0.5 }}
                                                            onError={(ev) => { ev.target.style.visibility = 'hidden'; }}
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" color="textSecondary">-</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>{name}</TableCell>
                                                <TableCell>
                                                    <IconButton size="small" color="error"
                                                        onClick={() => handleDeleteChannel(name)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {channelsForGroup.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={2} sx={{ color: 'text.secondary' }}>
                                                    {t('该分组下暂无频道')}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Paper>
            </Box>

            {/* 重命名分组弹窗 */}
            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{t('重命名分组')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameOpen(false)}>{t('取消')}</Button>
                    <Button variant="contained" disabled={saving} onClick={handleRename}>{t('保存')}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
