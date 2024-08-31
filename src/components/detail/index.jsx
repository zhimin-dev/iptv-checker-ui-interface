import { useState, useContext, useEffect } from 'react'
import * as React from 'react';
import { MainContext } from './../../context/main';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import Setting from './setting';
import { VirtualizedTable } from './vtable'
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import VideoJS from './../watch/video'
import Dialog from '@mui/material/Dialog';
import { appWindow,WebviewWindow } from "@tauri-apps/api/window";
import { useTranslation, initReactI18next } from "react-i18next";
import { emit, listen } from '@tauri-apps/api/event'

export default function Detail() {
  const { t } = useTranslation();
  const _mainContext = useContext(MainContext);
  const [vTableHeight, setVTableHeight] = useState(550)
  const [videoJsOptions, setVideoJsOptions] = useState(null)
  const [showWatch, setShowWatch] = useState(false)
  const playerRef = React.useRef(null);
  const handlePlayerReady = (player) => {
      playerRef.current = player;

      // You can handle player events here, for example:
      player.on('waiting', () => {
          console.log('player is waiting');
      });

      player.on('dispose', () => {
          console.log('player will dispose');
      });

      player.on('fullscreen', (e) => {
        console.log('full s', e)
      })

      player.ready(function() {
        var fullScreenButton = player.controlBar.fullscreenToggle;
      
        fullScreenButton.on('click', function() {
          appWindow.setFullscreen(true).then(res => {
            console.log("set full screeen")
          });
        });
      });
  };

  const [httpHeaders, setHttpHeaders] = useState([])
  const navigate = useNavigate();
  const [selectedArr, setSelectedArr] = useState([])//已选中的id
  const [showChannelMod, setShowChannelMod] = useState(0)// 0不显示弹框 1展示非编辑 2编辑页面
  const [showDetailObj, setShowDetailObj] = useState(null)// 选中查看对象

  const handleChange = (event) => {
    const { name, value } = event.target;
    setShowDetailObj(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const saveEditData = () => {
    _mainContext.updateDataByIndex([showDetailObj.index], {
      name: showDetailObj.name,
      tvgLogo: showDetailObj.tvgLogo,
      url: showDetailObj.url,
      groupTitle: showDetailObj.groupTitle,
    })
    setShowChannelMod(1)
  }

  useEffect(() => {
    setVTableHeight(window.innerHeight - _mainContext.headerHeight - 50)
    window.addEventListener("resize", e => {
      setVTableHeight(e.currentTarget.innerHeight - _mainContext.headerHeight - 50)
    })
    window.addEventListener('beforeunload', (e) => {
      e.preventDefault()
      let returnValue = t('刷新后将跳转首页')
      e.returnValue = returnValue
    })
    if(_mainContext.showM3uBody.length === 0) {
      navigate("/check")
    }
  }, [])

  const deleteThisRow = (index, tableIndex) => {
    let row = []
    for (let i = 0; i < selectedArr.length; i++) {
      if (selectedArr[i] !== index) {
        row.push(selectedArr[i]);
      }
    }
    setSelectedArr(row)
    _mainContext.deleteShowM3uRow(index)
  }

  const watchThisRow = async (val) => {
    let platform = _mainContext.nowPlatform
    if(_mainContext.nowMod === 1) {
      let label = 'watch'
      let data = WebviewWindow.getByLabel(label);
      if(data !== null) {
        // 携带负载对象触发 `click` 事件
        emit('changeWatchUrl', {
          data: val,
        })
        return 
      }
      const webview = new WebviewWindow(label, {
        url: '/watch/single?platform='+platform+'&url='+val.url,
        title:val.name,
        width: 1024,
        height: 600,
        skipTaskbar: true,
        decorations: false
      })
      
      // since the webview window is created asynchronously,
      // Tauri emits the `tauri://created` and `tauri://error` to notify you of the creation response
      webview.once('tauri://created', function () {
        // webview window successfully created
      })
      webview.once('tauri://error', function (e) {
        console.log('traui error ', e)
        // an error occurred during webview window creation
      })
    }else{
      window.open('/watch/single?platform='+platform+'&url='+val.url)
    }
  }

  const handleSelectCheckedAll = () => {
    let mod = 1//选中
    if (selectedArr.length > 0) {
      mod = 0//取消选择
    }
    let temp = []
    if (mod === 1) {
      for (let i = 0; i < _mainContext.showM3uBody.length; i++) {
        temp.push(_mainContext.showM3uBody[i].index)
      }
    }
    _mainContext.onSelectedOrNotAll(mod)
    setSelectedArr(temp)
  }

  const onSelectedThisRow = (index) => {
    _mainContext.onSelectedRow(index)
    let mod = 1//选中
    for (let i = 0; i < selectedArr.length; i++) {
      if (selectedArr[i] === index) {
        mod = 0//取消选择
      }
    }
    if (mod === 1) {
      setSelectedArr(pre => [...pre, index])
    } else {
      setSelectedArr(prev => prev.filter((val) => val !== index))
    }
  }

  const seeDetail = (val) => {
    if(showChannelMod !== 0 &&  showDetailObj !== null  && val.index === showDetailObj.index) {
      setShowChannelMod(0)
      return 
    }
    setShowChannelMod(1)
    setShowDetailObj(val)
  }

  const closeShowChangeObj = () => {
    setShowChannelMod(0)
  }

  const changeShowObj = () => {
    setShowChannelMod(2)
  }

  const handleWatchClose = () => {
    setShowWatch(false)
  }

  return (
    <Box style={{padding: '0 20px'}}>
      <Setting style={{marginTop: '20px'}} setSelectedArr={setSelectedArr} selectedArr={selectedArr}></Setting>
      <Dialog scroll="body" fullWidth onClose={handleWatchClose} open={showWatch}>
        <div>
          <VideoJS options={videoJsOptions} onReady={handlePlayerReady} headers={httpHeaders} />
        </div>
      </Dialog>
      <Paper style={{
        height: vTableHeight,
        marginTop: (_mainContext.headerHeight + 10) + "px",
      }}>
        <VirtualizedTable
          rowCount={_mainContext.showM3uBody.length}
          rowGetter={({ index }) => _mainContext.showM3uBody[index]}
          originalData={_mainContext.showM3uBody}
          delRow={deleteThisRow}
          selectAllRow={handleSelectCheckedAll}
          selectRow={onSelectedThisRow}
          seeDetail={seeDetail}
          watchRow={watchThisRow}
          nowMod={_mainContext.nowMod}
          t={() => t}
          // showOriginalUrl={_mainContext.settings.showFullUrl}
          selectedArr={selectedArr}
          selectAll={handleSelectCheckedAll}
          handleMod={_mainContext.handleMod}
          columns={[
            {
              width: 80,
              label: 'checkBox',
              dataKey: 'index',
            },
            {
              width: 600,
              label: t('名称'),
              dataKey: 'index',
            },
            {
              width: 100,
              label: t('延迟'),
              dataKey: 'index',
            },
          ]}
        />
      </Paper>
      {
        showChannelMod !== 0 ? (
          <Box sx={{
            position: 'fixed',
            'bottom': 100,
            'width': 600,
            'right': 0,
            'backgroundColor': '#fff',
            border: '3px solid #eee',
            borderRadius: '10px',
            padding: '10px'
          }}>
            <Box>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <FormControl sx={{ marginBottom: '25px', marginTop: '10px' }} fullWidth>
                  <TextField disabled={showChannelMod === 1} sx={{ fontSize: '11px' }} label={t('频道名称')} name="name" size="small" id="standard-multiline-static" value={showDetailObj.name} onChange={handleChange} />
                </FormControl>
                <FormControl sx={{ marginBottom: '25px' }} fullWidth>
                  <TextField disabled={showChannelMod === 1} sx={{ fontSize: '11px' }} label={t('m3u8地址')} name="url"  size="small" id="standard-multiline-static" value={showDetailObj.url} onChange={handleChange} />
                </FormControl>
                <FormControl sx={{ marginBottom: '25px' }} fullWidth>
                  <TextField disabled={showChannelMod === 1} sx={{ fontSize: '11px' }} label={t('logoUrl')} name="tvgLogo"  size="small" id="standard-multiline-static" value={showDetailObj.tvgLogo} onChange={handleChange} />
                </FormControl>
                <FormControl sx={{ marginBottom: '15px' }} fullWidth>
                  <TextField disabled={showChannelMod === 1} sx={{ fontSize: '11px' }} label={t('分组名称')} name="groupTitle"  size="small" id="standard-multiline-static" value={showDetailObj.groupTitle} onChange={handleChange} />
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {
                    showChannelMod === 2 ? (
                      <Button
                        size="small"
                        onClick={saveEditData}
                        variant="contained"
                        sx={{ marginRight: '5px' }}
                      >
                        {t('保存并关闭')}
                      </Button>
                    ) : ''
                  }
                  {
                    showChannelMod === 1 ? (
                      <Button
                        size="small"
                        onClick={changeShowObj}
                        variant="contained"
                        sx={{ marginRight: '5px' }}
                      >
                        {t('编辑')}
                      </Button>
                    ) : ''}
                  <Button
                    size="small"
                    onClick={closeShowChangeObj}
                    variant="contained"
                  >
                    {t('取消/关闭')}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : ''}
    </Box>
  )
}