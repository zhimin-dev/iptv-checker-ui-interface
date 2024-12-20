import { useState, useContext, useEffect } from 'react'
import { MainContext } from './../../context/main';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import SimpleDialog from './dialog';
import { styled } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Button from '@mui/material/Button';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ParseM3u from '../../utils/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTranslation, initReactI18next } from "react-i18next";

const ListItem = styled('li')(({ theme }) => ({
    margin: theme.spacing(0.5),
    listStyle: "none",
    display: 'initial',
}));

const ITEM_HEIGHT = 40;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 5,
            width: 200,
        },
    },
};

export default function Setting(props) {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const _mainContext = useContext(MainContext);
    const { selectedArr, setSelectedArr } = props;
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [searchTitle, setSearchTitle] = useState('')
    const [chipData, setChipData] = useState([]);
    const [dialogMod, setDialogMod] = useState(1);
    const [open, setOpen] = useState(false);
    const [selectedVideoTypes, setSelectedVideoTypes] = useState([]);

    const handleDeleteChip = (chipToDelete) => () => {
        setChipData((chips) => chips.filter((val, i) => i !== chipToDelete));
    }

    const handleChangeVideoTypes = (e) => {
        setSelectedVideoTypes(e.target.value)
        let _aMap = {}
        for (let i = 0; i < e.target.value.length; i++) {
            _aMap[e.target.value[i]] = e.target.value[i]
        }
        let uGroup = _mainContext.videoResolution
        for (let i = 0; i < uGroup.length; i++) {
            let checked = false
            if (_aMap[uGroup[i].value] !== undefined) {
                checked = true
            }
            uGroup[i].checked = checked
        }
        _mainContext.changeVideoResolution(uGroup)
    }

    useEffect(() => {
        initVideoResolution()
    }, [])

    const initVideoResolution = () => {
        let list = ParseM3u.getVideoResolutionList()
        let save = []
        for (let i = 0; i < list.length; i++) {
            save.push({ ...list[i], checked: false })
        }
        _mainContext.changeVideoResolution(save)
    }

    const handleChangeSearchTitle = (e) => {
        setSearchTitle(e.target.value)
    }

    const addNewSearchFilter = () => {
        if (searchTitle === '') {
            return
        }
        let isHit = false
        for (let i = 0; i < chipData.length; i++) {
            if (chipData[i] === searchTitle) {
                isHit = true
            }
        }
        if (!isHit) {
            setChipData([...chipData, searchTitle])
        }
        setSearchTitle("")
    }

    const doFilter = () => {
        _mainContext.filterM3u(chipData)
    }

    const exportValidM3uData = () => {
        _mainContext.onExportValidM3uData()
        setDialogMod(4)
        setOpen(true);
    }

    const showOriginalM3uBodyInfo = () => {
        _mainContext.changeDialogBodyData()
        setDialogMod(2)
        setOpen(true);
    }

    const handleClose = (value) => {
        setOpen(false);
    };

    const clearSelectedArr = () => {
        setSelectedArr([])
    }

    const handleNeedFastSource = (e) => {
        _mainContext.onChangeNeedFastSource(e.target.checked)
    }

    const handleChangeGroup = (e) => {
        setSelectedGroups(e.target.value)
        let _aMap = {}
        for (let i = 0; i < e.target.value.length; i++) {
            _aMap[e.target.value[i]] = e.target.value[i]
        }
        let uGroup = _mainContext.uGroups
        for (let i = 0; i < uGroup.length; i++) {
            let checked = false
            if (_aMap[uGroup[i].key] !== undefined) {
                checked = true
            }
            uGroup[i].checked = checked
        }
        _mainContext.setUGroups(uGroup)
    }

    const doTransferGroup = () => {
        setDialogMod(5)
        setOpen(true);
    }

    const doDelSelected = () => {
        for (let i = 0; i < selectedArr.length; i++) {
            _mainContext.deleteShowM3uRow(selectedArr[i])
        }
        setSelectedArr([])
    }

    return (
        <Box sx={{
            border: '1px solid #868686',
            padding: '8px',
            borderRadius: '5px'
        }}>
            <SimpleDialog
                open={open}
                onClose={handleClose}
                clearSelectedArrFunc={clearSelectedArr}
                setDialogMod={setDialogMod}
                selectedArr={selectedArr}
                mod={dialogMod}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                    <Box sx={{ marginBottom: '10px' }}>
                        <FormControl sx={{ marginRight: '5px' }}>
                            <Button startIcon={<FindInPageIcon />} size="small" onClick={showOriginalM3uBodyInfo} variant="outlined">{t('原始数据')}</Button>
                        </FormControl>
                        <FormControl sx={{
                            marginRight: "5px",
                        }}>
                            {
                                _mainContext.nowMod === 0 ? (
                                    <FormControlLabel 
                                    size="small"
                                    control={<Checkbox size="small" checked={_mainContext.needFastSource} onChange={handleNeedFastSource} />} 
                                    label={t('选择延迟最低的源')} />
                                ):''
                            }
                        </FormControl>
                        {
                            selectedArr.length > 0 ? (
                                <FormControl sx={{
                                    marginRight: "5px",
                                }}>
                                    <LoadingButton
                                        size="small"
                                        color="error"
                                        onClick={doDelSelected}
                                        variant="outlined"
                                        startIcon={<DeleteIcon />}
                                    >
                                        {t('删除选中')}
                                    </LoadingButton>
                                </FormControl>
                            ) : ''
                        }
                        {
                            selectedArr.length > 0 ? (
                                <FormControl sx={{
                                    marginRight: "5px",
                                }}>
                                    <LoadingButton
                                        size="small"
                                        onClick={doTransferGroup}
                                        variant="outlined"
                                        startIcon={<ChangeCircleIcon />}
                                    >
                                        {t('更换选中分组')}
                                    </LoadingButton>
                                </FormControl>
                            ) : ''
                        }
                        {
                            selectedArr.length > 0 ? (
                                <FormControl sx={{
                                    marginRight: "5px",
                                }}>
                                    <LoadingButton
                                        size="small"
                                        onClick={exportValidM3uData}
                                        variant="contained"
                                        startIcon={<ExitToAppIcon />}
                                    >
                                        {t('导出(下一步)')}
                                    </LoadingButton>
                                </FormControl>
                            ) : ''
                        }
                    </Box>
                    <Box sx={{ display: "flex" }}>
                        <Box component="form"
                            sx={{
                                marginBottom: "5px",
                                display: 'flex',
                                alignItems: 'flex-end'
                            }}>
                            <FormControl sx={{ marginRight: '5px', width: 200 }}>
                                <TextField
                                    id="outlined-name"
                                    variant="outlined"
                                    size="small"
                                    value={searchTitle}
                                    onChange={handleChangeSearchTitle}
                                    label={t('多关键词搜索')}
                                />
                            </FormControl>
                            <FormControl sx={{ marginRight: '5px' }}>
                                <LoadingButton
                                    size="small"
                                    onClick={addNewSearchFilter}
                                    variant="outlined"
                                    startIcon={<AddCircleOutlineIcon />}
                                >
                                    {t('添加关键词')}
                                </LoadingButton>
                            </FormControl>
                            <FormControl sx={{ width: 200, margin: 0, marginRight: '5px' }} size="small">
                                <InputLabel id="demo-select-small" size="small">{t('过滤分组')}</InputLabel>
                                <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    size="small"
                                    multiple
                                    value={selectedGroups}
                                    onChange={handleChangeGroup}
                                    input={<OutlinedInput size="small" label={t('过滤分组')} />}
                                    renderValue={(selectedGroups) => selectedGroups.join(', ')}
                                    MenuProps={MenuProps}
                                >
                                    {_mainContext.uGroups.map((value, index) => (
                                        <MenuItem key={index} value={value.key}>
                                            <Checkbox checked={value.checked} />
                                            <ListItemText primary={value.key} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl sx={{ width: 200, margin: 0, marginRight: '5px' }} size="small">
                                <InputLabel id="demo-select-small" size="small">{t('过滤视频清晰度')}</InputLabel>
                                <Select
                                    labelId="demo-select-small"
                                    id="demo-select-small"
                                    size="small"
                                    multiple
                                    value={selectedVideoTypes}
                                    onChange={handleChangeVideoTypes}
                                    input={<OutlinedInput size="small" label={t('过滤视频清晰度')} />}
                                    renderValue={(selectedVideoTypes) => selectedVideoTypes.join(', ')}
                                    MenuProps={MenuProps}
                                >
                                    {_mainContext.videoResolution.map((value, index) => (
                                        <MenuItem key={index} value={value.value}>
                                            <Checkbox checked={value.checked} />
                                            <ListItemText primary={value.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* <FormControl sx={{ marginRight: '5px' }}>
                                <LoadingButton
                                    size="small"
                                    onClick={doFilter}
                                    variant="contained"
                                    color="success"
                                    startIcon={<SearchIcon />}
                                >
                                    {t('搜索')}
                                </LoadingButton>
                            </FormControl> */}
                        </Box>
                    </Box>
                    <Box sx={{ paddingRight: "20px", fontSize: '12px' }}>
                        {
                            chipData.length > 0 ? t('频道名称包含')+":" : ''
                        }
                        {chipData.map((value, index) => {
                            return (
                                <ListItem key={index}>
                                    <Chip
                                        label={value}
                                        size="small"
                                        onDelete={handleDeleteChip(index)}
                                    />
                                    {
                                        index < chipData.length - 1 ? t('或') : ''
                                    }
                                </ListItem>
                            );
                        })}
                        {
                            chipData.length > 0 && selectedGroups.length > 0 ? t('且') : ''
                        }
                        {
                            selectedGroups.length > 0 ? t('只显示分组为')+'[' + selectedGroups.join(',') + ']'+t('的数据') : ''
                        }
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}