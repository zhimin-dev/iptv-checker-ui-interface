import * as React from 'react';
import { useState, useContext } from 'react';
import { MainContext } from './../../context/main';
import { useTranslation } from "react-i18next";
import {
    TableRow,
    TableCell,
    IconButton,
    Button,
    Tooltip,
    Collapse,
    Box,
    Table,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export const TaskRow = ({ row, clickTask, doTaskRightNow, showDownloadDialog, checkTaskRefetch, checkTaskContinue, checkTaskAgain }) => {
    const _mainContext = useContext(MainContext);
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const handleTaskRightNow = (id) => {
        doTaskRightNow(id);
    };

    const openDownloadDialog = (id) => {
        showDownloadDialog(id);
    };

    const handleTaskRefetch = (id) => {
        console.log("handleTaskRefetch", id);
        checkTaskRefetch(id)
    };

    const handleTaskContinue = (id) => {
        console.log("handleTaskContinue", id);
        checkTaskContinue(id)
    };

    const handleTaskAgain = (id) => {
        console.log("handleTaskContinue", id);
        checkTaskAgain(id)
    }

    return (
        <React.Fragment>
            <TableRow sx={{ minWidth: 1240 }}>
                <TableCell>
                    {row.task_info.next_run_time > 0 &&
                        row.task_info.next_run_time - new Date().getTime() / 1000 >= 180 &&
                        row.task_info.last_run_time > 0 &&
                        new Date().getTime() / 1000 - row.task_info.last_run_time >= 180 && (
                            <Button onClick={() => handleTaskRightNow(row.id)}>{t('立即执行')}</Button>
                        )}
                </TableCell>
                <TableCell component="th" scope="row" onClick={() => clickTask()}>
                    {row.id}
                </TableCell>
                <TableCell>
                    <Tooltip title={row.original.result_name}>
                        <div onClick={() => openDownloadDialog(row.id)}>
                            {row.original.result_name}
                        </div>
                    </Tooltip>
                </TableCell>
                <TableCell component="th" scope="row">
                    <div>{t('是否需要检查')}：{!row.original.no_check ? t('是') : t('否')}</div>
                    {!row.original.no_check && (
                        <>
                            <div>{t('检查方式')}：{row.original.ffmpeg_check ? t('ffmpeg慢速检查') : t('http快速检查')}</div>
                            {!row.original.ffmpeg_check && (
                                <div>{t('如果非http链接则跳过')}：{row.original.not_http_skip ? t('是') : t('否')}</div>
                            )}
                        </>
                    )}
                    <div>{t('是否需要排序')}：{row.original.sort ? t('是') : t('否')}</div>
                    <div>{t('是否需要去掉频道多余字符')}：{row.original.rename ? t('是') : t('否')}</div>
                    <div>{t('相同名称保存条数')}：{row.original.same_save_num > 0 ? row.original.same_save_num : t('保存全部')}</div>
                </TableCell>
                <TableCell align="right">
                    <div>{t('任务创建时间')}：{row.create_time > 0 ? (new Date(row.create_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })) : ''}</div>
                    {
                        row.task_info.last_run_time > 0 ? (
                            <div>{t('最后运行时间')}：{(new Date(row.task_info.last_run_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false }))}</div>
                        ) : ''
                    }
                    <div>
                        {t('当前状态')}：{row.task_info.task_status}
                        {
                            row.task_info.task_status === "FetchDataError" ? (
                                <span onClick={() => handleTaskRefetch(row.id)} style={{color: 'red'}}>{t('重新获取')}</span>
                            ):''
                        }
                        {
                            row.task_info.task_status === "FetchSomeDataError" ? (
                                <span onClick={() => handleTaskContinue(row.id)} style={{color: 'orange'}}>{t('继续执行')}</span>
                            ):''
                        }
                        {
                            row.task_info.task_status === "Completed" ? (
                                <span onClick={() => handleTaskAgain(row.id)} style={{color: 'green'}}>{t('再次检查')}</span>
                            ):''
                        }
                    </div>
                    {
                        _mainContext.nowMod === 0 ? (
                            <div>{t('下一次运行时间')}：{row.task_info.next_run_time > 0 ? (new Date(row.task_info.next_run_time * 1000).toLocaleTimeString('zh-CN', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })) : ''}</div>
                        ) : ''
                    }
                    {
                        _mainContext.nowMod === 0 ? (
                            <div>{t('运行时间')}：{row.task_info.run_type === 'EveryHour' ? t('每小时一次') : t('每天一次')}</div>
                        ) : ''
                    }
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}; 