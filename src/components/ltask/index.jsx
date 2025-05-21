import * as React from 'react';
import { useEffect, useContext, useRef, useState } from "react"
import { MainContext } from './../../context/main';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import GetAppIcon from '@mui/icons-material/GetApp';
import PublishIcon from '@mui/icons-material/Publish';
import { useTranslation } from "react-i18next";
import { WebTaskService } from '../../services/webTaskService';
import { TaskForm } from '../task/TaskForm';
import { TaskRow } from '../task/TaskRow';
import { DownloadDialog } from '../task/DownloadDialog';
import { ImportDialog, ExportDialog } from '../task/ImportExportDialog';

export default function LTaskList() {
    const _mainContext = useContext(MainContext);
    const { t } = useTranslation();
    const [taskService] = useState(() => new WebTaskService());

    const [formDialog, setFormDialog] = useState(false);
    const [formValue, setFormValue] = useState(null);
    const [taskList, setTaskList] = useState([]);
    const [openAlertBar, setOpenAlertBar] = useState(false);
    const [alertBarMsg, setAlertBarMsg] = useState("");
    const [openDownloadBody, setOpenDownloadBody] = useState(false);
    const [downloadBody, setDownloadBody] = useState({ "content": "", "url": "" });
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportBody, setExportBody] = useState('');

    useEffect(() => {
        get_task_list();
    }, []);

    const handleClickOpen = (value) => {
        setFormValue(value);
        setFormDialog(true);
    };

    const handleClose = () => {
        setFormDialog(false);
        setFormValue(null);
    };

    const handleSave = async (value) => {
        try {
            if (value.id === '') {
                await taskService.addTask(value);
            } else {
                await taskService.updateTask(value.id, value);
            }
            get_task_list();
        } catch (e) {
            handleOpenAlertBar(e.message);
        }
    };

    const handleDelete = async (value) => {
        try {
            await taskService.deleteTask(value.id);
            get_task_list();
        } catch (e) {
            handleOpenAlertBar(e.message);
        }
    };

    const get_task_list = async () => {
        try {
            const data = await taskService.getTaskList();
            setTaskList(data.list);
        } catch (e) {
            setTaskList([]);
            handleOpenAlertBar(t('获取任务失败，请检查服务是否正常启动'));
        }
    };

    const handleOpenAlertBar = (msg) => {
        setAlertBarMsg(msg);
        setOpenAlertBar(true);
    };

    const handleCloseAlertBar = () => {
        setAlertBarMsg("");
        setOpenAlertBar(false);
    };

    const doTaskRightNow = async (id) => {
        try {
            await taskService.runTask(id);
            get_task_list();
        } catch (e) {
            handleOpenAlertBar(t('操作失败'));
        }
    };

    const getDownloadBody = async (id) => {
        try {
            const data = await taskService.getDownloadBody(id);
            setOpenDownloadBody(true);
            setDownloadBody({ 'content': data.content, "url": data.url });
        } catch (e) {
            handleOpenAlertBar(t('操作失败'));
        }
    };

    const handleDownloadClose = (val) => {
        setOpenDownloadBody(val);
    };

    const refreshList = () => {
        setTaskList([]);
        get_task_list();
    };

    const handleImportDialog = (val) => {
        setShowImportDialog(val);
    };

    const handleExportDialog = async (val) => {
        if (val) {
            try {
                const data = await taskService.exportTasks();
                setShowExportDialog(true);
                setExportBody(JSON.stringify(data));
            } catch (e) {
                handleOpenAlertBar(t('获取失败'));
            }
        } else {
            setShowExportDialog(false);
        }
    };

    const handleSaveImportData = async (val) => {
        try {
            const data = JSON.parse(val);
            await taskService.importTasks(data);
            setShowImportDialog(false);
            refreshList();
        } catch (e) {
            handleOpenAlertBar(t('保存失败'));
        }
    };

    return (
        <Box style={{ padding: '0 20px' }}>
            <>
                <Box style={{
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleClickOpen(null)}
                            style={{ marginRight: '10px' }}
                        >
                            {t('新增')}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={refreshList}
                        >
                            {t('刷新列表')}
                        </Button>
                    </Box>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<PublishIcon />}
                            style={{ marginRight: '10px' }}
                            onClick={() => handleImportDialog(true)}
                        >
                            {t('任务导入')}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<GetAppIcon />}
                            onClick={() => handleExportDialog(true)}
                        >
                            {t('全部任务导出')}
                        </Button>
                    </Box>
                </Box>
                <Snackbar
                    open={openAlertBar}
                    autoHideDuration={6000}
                    onClose={handleCloseAlertBar}
                    message={alertBarMsg}
                />
                <TaskForm
                    taskService={taskService}
                    formValue={formValue}
                    open={formDialog}
                    onClose={handleClose}
                    handleSave={handleSave}
                    handleDelete={handleDelete}
                    checkType="local"
                    output_folder = ""
                />
                <DownloadDialog
                    formValue={downloadBody}
                    open={openDownloadBody}
                    onClose={handleDownloadClose}
                />
                <ImportDialog
                    open={showImportDialog}
                    onClose={handleImportDialog}
                    onSave={handleSaveImportData}
                />
                <ExportDialog
                    open={showExportDialog}
                    formValue={exportBody}
                    onClose={handleExportDialog}
                />
                <Paper sx={{ width: '1240px', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>{t('任务id')}</TableCell>
                                    <TableCell>{t('输出文件')}</TableCell>
                                    <TableCell>{t('任务信息')}</TableCell>
                                    <TableCell align="right">{t('运行时间')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {taskList.map((row) => (
                                    <TaskRow
                                        key={row.id}
                                        row={row}
                                        doTaskRightNow={doTaskRightNow}
                                        showDownloadDialog={getDownloadBody}
                                        clickTask={() => handleClickOpen(row)}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </>
        </Box>
    );
} 