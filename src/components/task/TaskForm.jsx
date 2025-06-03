import * as React from 'react';
import { useEffect, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { MainContext } from './../../context/main';
import {
    Dialog,
    Box,
    Stepper,
    Step,
    StepLabel,
    Typography,
    Button,
    FormControl,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    Stack,
    Chip,
    RadioGroup,
    FormControlLabel,
    Radio,
    IconButton,
    DialogTitle,
    DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import PublicIcon from '@mui/icons-material/Public';
import UploadIcon from '@mui/icons-material/Upload';

const run_type_list = [{ "value": "EveryDay", "name": "每天" }, { "value": "EveryHour", "name": "每小时" }];
const output_extenion = ".m3u";

const defaultValue = {
    "original": {
        "urls": [],
        "result_name": "",
        "md5": "",
        "run_type": "EveryDay",
        "keyword_dislike": [],
        "keyword_like": [],
        "http_timeout": 20000,
        "check_timeout": 20000,
        "concurrent": 30,
        "sort": false,
        "no_check": false,
        "rename": false,
        "ffmpeg_check": false,
        "not_http_skip": false,
        "same_save_num": 0,
    },
    "id": "",
    "create_time": 0,
    "task_info": {
        "run_type": "EveryDay",
        "last_run_time": 0,
        "next_run_time": 0,
        "is_running": false,
        "task_status": "Pending"
    }
};

export const TaskForm = ({ onClose, formValue, open, onSave, handleSave, handleDelete, taskService, checkType, output_folder }) => {
    const { t } = useTranslation();
    const _mainContext = useContext(MainContext);
    const [task, setTask] = useState(defaultValue);
    const [filterKeyword, setFilterKeyword] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [delOpen, setDelOpen] = useState(false);

    const steps = ['基础配置', '个性化配置', '检查配置'];

    useEffect(() => {
        if (!open) {
            let default_data = JSON.parse(JSON.stringify(defaultValue));
            if (default_data.original.result_name === '') {
                default_data.original.result_name = randomString(10);
            }
            setTask(default_data);
            setFilterKeyword('');
            setActiveStep(0);
            setDelOpen(false);
        }
    }, [open]);

    useEffect(() => {
        setActiveStep(0);
        if (formValue !== null) {
            const processedFormValue = {
                ...formValue,
                original: {
                    ...formValue.original,
                    result_name: formValue.original.result_name.replace(output_folder, "").replace(output_extenion, ""),
                    http_timeout: formValue.original.http_timeout ?? 0,
                    check_timeout: formValue.original.check_timeout ?? 0,
                    concurrent: formValue.original.concurrent ?? 0,
                    sort: formValue.original.sort ?? false,
                    no_check: formValue.original.no_check ?? false,
                    rename: formValue.original.rename ?? false,
                    ffmpeg_check: formValue.original.ffmpeg_check ?? false,
                    not_http_skip: formValue.original.not_http_skip ?? false,
                    same_save_num: formValue.original.same_save_num ?? 0,
                }
            };
            setTask(processedFormValue);
        } else {
            let default_data = JSON.parse(JSON.stringify(defaultValue));
            if (default_data.original.result_name === '') {
                default_data.original.result_name = randomString(10);
            }
            setTask(default_data);
        }
    }, [formValue]);

    const randomString = (len) => {
        len = len || 32;
        const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
        const maxPos = chars.length;
        let pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSaveClick = () => {
        handleSave(task);
        onClose();
    };

    const handleDeleteClick = () => {
        handleDelete(task);
        handleDelClose();
        onClose();
    };

    const addNewM3uLinkByUrl = (url) => {
        const newUrls = [...task.original.urls, url];
        setTask({
            ...task,
            original: {
                ...task.original,
                urls: newUrls
            }
        });
    }

    const parseUrlId = (input_name) => {
        return parseInt(input_name.replace("url-", ""), 10)
    }

    const addNewM3uLink = () => {
        addNewM3uLinkByUrl("")
    }

    const handleDelClickOpen = () => {
        setDelOpen(true);
    };

    const handleDelClose = () => {
        setDelOpen(false);
    };

    const handleAddUrl = () => {
        if (filterKeyword.trim() !== '') {
            setTask(prev => ({
                ...prev,
                original: {
                    ...prev.original,
                    urls: [...prev.original.urls, filterKeyword.trim()]
                }
            }));
            setFilterKeyword('');
        }
    };

    const handleDeleteUrl = (index) => {
        setTask(prev => ({
            ...prev,
            original: {
                ...prev.original,
                urls: prev.original.urls.filter((_, i) => i !== index)
            }
        }));
    };

    const handleAddKeyword = (type) => {
        if (filterKeyword.trim() !== '') {
            setTask(prev => ({
                ...prev,
                original: {
                    ...prev.original,
                    [type]: [...prev.original[type], filterKeyword.trim()]
                }
            }));
            setFilterKeyword('');
        }
    };

    const changeCheckTimeout = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                check_timeout: parseInt(e.target.value, 10)
            }
        });
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 上传文件到服务器
            const formData = new FormData();
            formData.append('file', file);
            let response = await taskService.uploadFile(formData);

            // 添加文件链接到任务
            addNewM3uLinkByUrl(response.url);
        } catch (error) {
            console.error('文件处理失败', error);
        }
    }

    const changeHttpTimeout = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                http_timeout: parseInt(e.target.value, 10)
            }
        });
    }

    const addKeyword = (type) => {
        if (filterKeyword === '') {
            return
        }
        if (type === 1) {
            let kw = task.original.keyword_like ?? [];
            kw.push(filterKeyword)
            setTask({
                ...task,
                original: {
                    ...task.original,
                    keyword_like: uniqueArr(kw)
                }
            });
        } else if (type === 2) {
            let kw = task.original.keyword_dislike ?? [];
            kw.push(filterKeyword)
            setTask({
                ...task,
                original: {
                    ...task.original,
                    keyword_dislike: uniqueArr(kw)
                }
            });
        }
        setFilterKeyword("")
    }

    const uniqueArr = (array) => {
        return array.filter((item, index) => array.indexOf(item) === index)
    }

    const changeFilterKeyword = (e) => {
        setFilterKeyword(e.target.value)
    }

    const changeUrls = (e) => {
        const index = parseUrlId(e.target.name);
        const newUrls = [...task.original.urls]; // 创建urls数组的副本
        newUrls[index] = e.target.value; // 在指定索引处设置新的值

        const updatedTask = { ...task, original: { ...task.original, urls: newUrls } }; // 创建包含更新后的urls数组的新task对象
        setTask(updatedTask); // 设置更新后的task对象为新的状态值
    }

    const changeResultName = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                result_name: e.target.value
            }
        });
    }

    const handleChangeRunType = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                run_type: e.target.value
            }
        });
    }

    const handleDeleteKeyword = (type, index) => {
        setTask(prev => ({
            ...prev,
            original: {
                ...prev.original,
                [type]: prev.original[type].filter((_, i) => i !== index)
            }
        }));
    };

    const handleInputChange = (field, value) => {
        setTask(prev => ({
            ...prev,
            original: {
                ...prev.original,
                [field]: value
            }
        }));
    };

    const changeConcurrent = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                concurrent: parseInt(e.target.value, 10)
            }
        });
    }

    const handleChangeSortValue = (e) => {
        let checked = false
        if (e.target.defaultValue === "false") {
            checked = false
        } else {
            checked = true
        }
        setTask({
            ...task,
            original: {
                ...task.original,
                sort: checked
            }
        });
    }

    const changeSameSaveNum = (e) => {
        setTask({
            ...task,
            original: {
                ...task.original,
                same_save_num: parseInt(e.target.value, 10)
            }
        });
    }

    const handleChangeRename = (e) => {
        let checked = false
        if (e.target.defaultValue === "false") {
            checked = false
        } else {
            checked = true
        }
        setTask({
            ...task,
            original: {
                ...task.original,
                rename: checked
            }
        });
    }

    const handleChangeNotHttpSkip = (e) => {
        let checked = false
        if (e.target.defaultValue === "false") {
            checked = false
        } else {
            checked = true
        }
        setTask({
            ...task,
            original: {
                ...task.original,
                not_http_skip: checked
            }
        });
    }

    const handleChangeFfmepgCheck = (e) => {
        let checked = false
        if (e.target.defaultValue === "false") {
            checked = false
        } else {
            checked = true
        }
        setTask({
            ...task,
            original: {
                ...task.original,
                ffmpeg_check: checked
            }
        });
    }

    const handleChangeNoCheckValue = (e) => {
        let checked = false
        if (e.target.defaultValue === "false") {
            checked = false
        } else {
            checked = true
        }
        setTask({
            ...task,
            original: {
                ...task.original,
                no_check: checked
            }
        });
    }

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ mt: 2 }}>
                        {
                            task.original.urls.length > 0 ? (
                                <FormControl fullWidth style={{
                                    padding: "0 0 20px",
                                }}>
                                    <Typography variant="subtitle1" component="div">{t('检查文件列表')}</Typography>
                                    {
                                        task.original.urls.map((value, index) => (
                                            <Stack direction="row" spacing={1} key={index}>
                                                <TextField style={{ width: '100%' }} disabled={value.startsWith("static") || value.startsWith("localstorage")} id="standard-basic" variant="standard" name={"url-" + index} value={value} onChange={changeUrls} />
                                                <IconButton aria-label="delete" onClick={() => handleDeleteUrl(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        ))
                                    }
                                </FormControl>
                            ) : ''
                        }
                        <FormControl fullWidth style={{
                            padding: "20px 0 20px", display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <Button variant="outlined" onClick={() => addNewM3uLink()} startIcon={<PublicIcon />}>{t('添加在线链接')}</Button>
                            <Button variant="contained" component="label" startIcon={<UploadIcon />}>
                                {t('本地上传m3u文件')}
                                <input hidden accept="*" multiple type="file" onChange={handleFileUpload} />
                            </Button>
                        </FormControl>
                        {
                            checkType === 'server' ? (
                                <FormControl fullWidth style={{
                                    margin: "0 0 20px",
                                }}>
                                    <InputLabel id="demo-simple-select-standard-label">{t('定时检查时间')}</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={task.original.run_type}
                                        label={t('定时检查时间')}
                                        onChange={handleChangeRunType}
                                    >
                                        {
                                            run_type_list.map((value, index) => (
                                                <MenuItem value={value.value} key={index}>{value.name}</MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                            ) : ''
                        }
{
                            checkType === 'server' ? (
                        <FormControl fullWidth style={{
                            margin: "20px 0 20px",
                        }}>
                            <InputLabel htmlFor="outlined-adornment-amount">{t('结果文件名')}</InputLabel>
                            <OutlinedInput
                                style={{ width: '100%' }}
                                name="resultName"
                                endAdornment={<InputAdornment position="end">{output_extenion}</InputAdornment>}
                                startAdornment={<InputAdornment position="start">{output_folder}</InputAdornment>}
                                aria-describedby="outlined-weight-helper-text"
                                label={t('结果文件名')}
                                value={task.original.result_name}
                                onChange={changeResultName}
                            />
                        </FormControl>
                            ):''}

                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ mt: 2 }}>
                        {
                            task.original.keyword_like !== null && task.original.keyword_like.length > 0 ? (
                                <FormControl fullWidth style={{
                                    padding: "0 0 20px",
                                }}>
                                    <Typography variant="subtitle1" component="div">{t('只看频道关键词')}</Typography>
                                    <Stack direction="row" spacing={1}>
                                        {
                                            task.original.keyword_like !== null && task.original.keyword_like.map((value, i) => (
                                                <Chip
                                                    label={value}
                                                    onDelete={() => deleteThisLikeKw(i)}
                                                    variant="outlined"
                                                    key={i}
                                                />
                                            ))
                                        }
                                    </Stack>
                                </FormControl>
                            ) : ''
                        }
                        {
                            task.original.keyword_dislike !== null && task.original.keyword_dislike.length > 0 ? (
                                <FormControl fullWidth style={{
                                    padding: "0 0 10px",
                                }}>
                                    <Typography variant="subtitle1" component="div">{t('不看频道关键词')}</Typography>
                                    <Stack direction="row" spacing={1}>
                                        {
                                            task.original.keyword_dislike.map((value, i) => (
                                                <Chip
                                                    label={value}
                                                    variant="outlined"
                                                    onDelete={() => deleteThisDislikeKw(i)}
                                                    key={i}
                                                />
                                            ))
                                        }
                                    </Stack>
                                </FormControl>
                            ) : ''
                        }
                        <FormControl fullWidth style={{
                            margin: "10px 0 20px",
                        }}>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    id="standard-basic"
                                    label={t('添加关键词')}
                                    variant="standard"
                                    value={filterKeyword} onChange={changeFilterKeyword} />
                                <Button
                                    size='small'
                                    variant="outlined"
                                    onClick={() => addKeyword(1)}
                                    startIcon={<InsertEmoticonIcon />}
                                >{t('添加只看')}</Button>
                                <Button
                                    size='small'
                                    variant="outlined"
                                    onClick={() => addKeyword(2)}
                                    startIcon={<MoodBadIcon />}>{t('添加不看')}</Button>
                            </Stack>
                        </FormControl>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth style={{
                            margin: "20px 0 20px",
                        }}>
                            <Typography variant="subtitle1" component="div">{t('http超时(毫秒ms)')}</Typography>
                            <TextField id="standard-basic" variant="standard" value={task.original.http_timeout} onChange={changeHttpTimeout} />
                        </FormControl>
                        <FormControl fullWidth style={{
                            margin: "20px 0 20px",
                        }}>
                            <Typography variant="subtitle1" component="div">{t('检查超时(毫秒ms)')}</Typography>
                            <TextField id="standard-basic" variant="standard" value={task.original.check_timeout} onChange={changeCheckTimeout} />
                        </FormControl>


                        <FormControl fullWidth style={{
                            margin: "10px 0 20px",
                        }}>
                            <Typography variant="subtitle1" component="div">{t('是否需要检查')}</Typography>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                value={task.original.no_check}
                                onChange={handleChangeNoCheckValue}
                            >
                                <FormControlLabel value="false" control={<Radio />} label={t('是')} />
                                <FormControlLabel value="true" control={<Radio />} label={t('否')} />
                            </RadioGroup>
                        </FormControl>
                        {
                            task.original.no_check === false ? (
                                <>
                                    <FormControl fullWidth style={{
                                        margin: "10px 0 20px",
                                    }}>
                                        <Typography variant="subtitle1" component="div">{t('检查并发数')}</Typography>
                                        <TextField id="standard-basic" variant="standard" value={task.original.concurrent} onChange={changeConcurrent} />
                                    </FormControl>
                                    <FormControl fullWidth style={{
                                        margin: "10px 0 20px",
                                    }}>
                                        <Typography variant="subtitle1" component="div">{t('检查方式')}</Typography>
                                        <RadioGroup
                                            row
                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                            name="row-radio-buttons-group"
                                            value={task.original.ffmpeg_check}
                                            onChange={handleChangeFfmepgCheck}
                                        >
                                            <FormControlLabel value="false" control={<Radio />} label={t('http快速检查')} />
                                            <FormControlLabel value="true" disabled={_mainContext.ffmepgCheck == 0 && _mainContext.nowMod === 1} control={<Radio />} label={t('ffmpeg慢速检查')} />
                                        </RadioGroup>
                                    </FormControl>
                                    {
                                        task.original.ffmpeg_check === false ? (
                                            <FormControl fullWidth style={{
                                                margin: "10px 0 20px",
                                            }}>
                                                <Typography variant="subtitle1" component="div">{t('如果非http链接则跳过')}</Typography>
                                                <RadioGroup
                                                    row
                                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                                    name="row-radio-buttons-group"
                                                    value={task.original.not_http_skip}
                                                    onChange={handleChangeNotHttpSkip}
                                                >
                                                    <FormControlLabel value="false" control={<Radio />} label={t('否')} />
                                                    <FormControlLabel value="true" control={<Radio />} label={t('是')} />
                                                </RadioGroup>
                                            </FormControl>
                                        ) : ''
                                    }
                                </>
                            ) : ''
                        }
                        <FormControl fullWidth style={{
                            margin: "10px 0 20px",
                        }}>
                            <Typography variant="subtitle1" component="div">{t('是否需要去掉频道多余字符(比如"[HD]CCTV1"将去掉"[HD]"字符)')}</Typography>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                value={task.original.rename}
                                onChange={handleChangeRename}
                            >
                                <FormControlLabel value="false" control={<Radio />} label={t('否')} />
                                <FormControlLabel value="true" control={<Radio />} label={t('是')} />
                            </RadioGroup>
                        </FormControl>
                        <FormControl fullWidth style={{
                            margin: "10px 0 20px",
                        }}>
                            <Typography variant="subtitle1" component="div">{t('是否需要排序')}</Typography>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                value={task.original.sort}
                                onChange={handleChangeSortValue}
                            >
                                <FormControlLabel value="false" control={<Radio />} label={t('否')} />
                                <FormControlLabel value="true" control={<Radio />} label={t('是')} />
                            </RadioGroup>
                        </FormControl>
                        <FormControl fullWidth style={{
                            margin: "10px 0 20px",
                        }}>
                            <Typography variant="subtitle1" component="div">{t('相同名称保存条数(默认0全部保存， 设置大于0则保存相应数量频道)')}</Typography>
                            <TextField id="standard-basic" variant="standard" value={task.original.same_save_num} onChange={changeSameSaveNum} />
                        </FormControl>

                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Dialog
                open={delOpen}
                onClose={handleDelClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"确定要删除吗？删除后不可恢复"}</DialogTitle>
                <DialogActions>
                    <Button onClick={handleDelClose}>No</Button>
                    <Button onClick={handleDeleteClick}>Yes</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                onClose={onClose}
                open={open}
                disableEnforceFocus
                disableAutoFocus
                disableRestoreFocus
            >
                <Box sx={{ width: '100%', padding: '40px' }}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    <React.Fragment>
                        {renderStepContent(activeStep)}
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                            {activeStep !== 0 && (
                                <Button
                                    color="inherit"
                                    onClick={handleBack}
                                    sx={{ mr: 1 }}
                                >
                                    上一页
                                </Button>
                            )}
                            {activeStep === 0 && task.id !== '' && (
                                <Button
                                    color="error"
                                    onClick={handleDelClickOpen}
                                    startIcon={<DeleteIcon />}
                                >
                                    {t('删除')}
                                </Button>
                            )}
                            <Box sx={{ flex: '1 1 auto' }} />
                            {activeStep === steps.length - 1 ? (
                                checkType === 'server' || task.id === '' ? (
                                    <Button onClick={handleSaveClick}>
                                        保存
                                    </Button>
                                ) : ''
                            ) : (
                                <Button onClick={handleNext}>
                                    下一页
                                </Button>
                            )}
                        </Box>
                    </React.Fragment>
                </Box>
            </Dialog>
        </>
    );
};