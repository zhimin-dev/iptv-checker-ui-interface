import React, { createContext, useEffect, useRef, useState } from 'react';
import axios from "axios"
import ParseM3u from '../utils/utils'
const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [nowMod, setNowMod] = useState(0);// 当前运行模式 0服务端模式 1客户端模式
    const [checkConcurrent, setCheckConcurrent] = useState(4)// 后台任务
    const [nowTaskId, setNowTaskId] = useState("")// 正在执行的任务id
    const [taskList, setTaskList] = useState([])// 正在执行的任务列表

    const [tasks, setTasks] = useState([]);
    // "status": "pending",// prepare now pending completed
    // "total": 0,// 总任务数
    // "checkCount": 0,// 已检查
    // "success": 0,// 成功
    // "failed": 0,// 失败

    const workersRef = useRef([]);
    const tasksCompletedRef = useRef(0);
    const taskListRef = useRef([])
    const nowTaskIdRef = useRef("")
    const tasksRef = useRef([])
    const taskRef = useRef(null);

    const localCahceTasksKey = "localTasks"
    const localCahceNowTaskId = "nowTaskId"
    const localCahceNowTaskList = "nowTaskList"

    const saveToLocalStorage = (data, key) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // 从localstorage加载数据
    const loadFromLocalStorage = () => {
        const data = localStorage.getItem(localCahceTasksKey);
        let tasks = []
        if (data) {
            tasks = JSON.parse(data)
        }
        updateTasks(tasks);

        const nowTaskId = localStorage.getItem(localCahceNowTaskId);
        console.log("----nowTaskId", nowTaskId)
        if (nowTaskId !== '') {
            updateNowTaskId(nowTaskId, false)
        } else {
            updateNowTaskId("", false)
        }

        const taskList = localStorage.getItem(localCahceNowTaskList);
        if (taskList) {
            updateTaskList(JSON.parse(taskList));
        } else {
            updateTaskList([])
        }

        // 组装list字段
        fulfilled_data(tasks)
    };

    const m3u8BodyToStructList = (body) => {
        try {
            return ParseM3u.parseOriginalBodyToList(body)
        } catch (e) {
            console.log("======err", e)
            return []
        }
    }

    const fulfilled_data = (tList) => {
        for (let i = 0; i < tList.length; i++) {
            let list = [];
            console.log("---id-000", tList[i].id, tList[i].original.urls)
            for (let j = 0; j < tList[i].original.urls.length; j++) {
                if (tList[i].original.urls[j].status === 200) {
                    let parseDataList = m3u8BodyToStructList(tList[i].original.urls[j].body)
                    for (let x = 0; x < parseDataList.length; x++) {
                        list.push(parseDataList[x])
                    }
                }
            }
            console.log("---id", tList[i].id, list)
            updateTaskInfo(tList[i].id, list)
        }
    }

    // const checkNowTaskHasComplete = () => {
    //     console.log("task list ----",taskListRef.current.length)
    //     if (taskListRef.current.length > 0) {
    //         let noTask = true
    //         for (let i = 0; i < taskListRef.current.length; i++) {
    //             if (taskListRef.current[i].status == 0) {
    //                 noTask = false
    //             }
    //         }
    //         if (noTask) {
    //             console.log(nowTaskIdRef.current,"task is complated,----")
    //             taskHasComplate(nowTaskIdRef.current)
    //         }
    //     }
    // }

    const taskHasComplate = (taskId) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.id === taskId ? { ...task, status: "completed" } : task
            )
            saveToLocalStorage(updatedTasks, localCahceTasksKey)
            tasksRef.current = updatedTasks
            return updatedTasks
        });
        updateTaskList([])
        updateNowTaskId("", true)
    }

    const updateTasks = (list) => {
        setTasks(list)
        saveToLocalStorage(list, localCahceTasksKey)
        tasksRef.current = list
    }

    const updateTaskList = (list) => {
        setTaskList(list)
        saveToLocalStorage(list, localCahceNowTaskList)
        taskListRef.current = list
    }

    const updateNowTaskId = (nowTaskId, saveLocalstorage) => {
        setNowTaskId(nowTaskId)
        if(saveLocalstorage) {
            saveToLocalStorage(nowTaskId, localCahceNowTaskId)
        }
        nowTaskIdRef.current = nowTaskId
    }

    const updateTaskInfo = (taskId, list) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.id === taskId ? { ...task, list } : task
            )
            saveToLocalStorage(updatedTasks, localCahceTasksKey)
            tasksRef.current = updatedTasks
            return updatedTasks
        });
    };

    const startTask = () => {
        if (!taskRef.current) {
            taskRef.current = setInterval(checkTaskIsChecking, 10000); // 每5秒执行一次当前是否还有任务在检查
        }
    }

    const checkTaskIsChecking = () => {
        let needStartWorker = false
        let tempNowTaskId = ""
        // 检查当前任务是否完成
        console.log("task list ----",taskListRef.current.length)
        if (taskListRef.current.length > 0) {
            let noTask = true
            for (let i = 0; i < taskListRef.current.length; i++) {
                if (taskListRef.current[i].status == 0) {
                    noTask = false
                }
            }
            if (noTask) {
                console.log(nowTaskIdRef.current,"task is complated,----")
                tempNowTaskId= nowTaskIdRef.current
                taskHasComplate(nowTaskIdRef.current)
            }
        }
        // 仅当当前没有任务时，需要取其他任务获取
        if (taskListRef.current.length === 0) {
            let nowId = ''
            let tList = []
            console.log("now task info---", tasksRef.current)
            for (let i = 0; i < tasksRef.current.length; i++) {
                if (tasksRef.current[i].status === 'pending' && nowId === '' && tasksRef.current[i].id !== tempNowTaskId) {
                    nowId = tasksRef.current[i].id
                    tList = tasksRef.current[i].list
                }
            }
            console.log("----- task list reset", nowId,tList)
            updateTaskList(tList)
            updateNowTaskId(nowId, true)
            if (tList.length > 0) {
                needStartWorker = true
            }
        } else {
            // 如果当前没有任务，去list检查是否还有待检查的任务
            if (workersRef.current === null || workersRef.current.length === 0) {
                let hasTask = false
                for (let i = 0; i < taskListRef.current.length; i++) {
                    if (taskListRef.current[i].status === 0) {
                        hasTask = true
                    }
                }
                if (hasTask) {
                    needStartWorker = true
                }
            }
        }
        if (needStartWorker) {
            console.log("now----start worker", taskListRef.current )
            startWorker()
        } else {
            if (workersRef.current !== null && workersRef.current.length > 0) {
                console.log("now----clear worker")
                tasksCompletedRef.current = 0
                clearWorker()
            }
        }
    }

    const stopTask = () => {
        if (taskRef.current) {
            clearInterval(taskRef.current);
            taskRef.current = null;
        }
    };

    const startWorker = () => {
        // 创建一组 Web Workers
        const createWorkers = (count) => {
            const workers = [];
            for (let i = 0; i < count; i++) {
                const worker = new Worker(new URL('./check-task.js', import.meta.url));
                worker.onmessage = (e) => {
                    const { index, task, result } = e.data;
                    console.log("task----", index, result)
                    updateTaskListResult(index, task, result);
                };
                workers.push(worker);
            }
            return workers;
        };

        workersRef.current = createWorkers(checkConcurrent); // 创建N个 worker

        // 开始处理每个任务
        const processTasks = () => {
            taskListRef.current.forEach(task => {
                if (task.status === 0) {
                    const worker = workersRef.current[tasksCompletedRef.current % workersRef.current.length];
                    worker.postMessage({ index: task.index, nowMod, task }); // 发送任务信息
                    tasksCompletedRef.current++;
                }
            });
        };
        processTasks();
    }

    const clearWorker = () => {
        workersRef.current.forEach(worker => worker.terminate());
    }

    useEffect(() => {
        loadFromLocalStorage()
        // 开启worker
        startTask();
        // 清理 Worker
        return () => {
            stopTask()
        };
    }, []);

    const updateTaskListResult = (index, passTask, result) => {
        setTaskList(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.index === index ? { ...task, status: result['status'] } : task
            )
            taskListRef.current = updatedTasks
            saveToLocalStorage(updatedTasks, localCahceNowTaskList)
            return updatedTasks
        });
    };

    const updateTaskStatus = (taskId, status) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.id === taskId ? { ...task, status } : task
            )
            saveToLocalStorage(updatedTasks, localCahceTasksKey)
            tasksRef.current = updatedTasks
            return updatedTasks
        });
    };

    const updateTaskOriginalUrls = (taskId, urls) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.id === taskId ? {
                    ...task, original: {
                        ...task.original,
                        urls: urls
                    }
                } : task
            )
            saveToLocalStorage(updatedTasks, localCahceTasksKey)
            tasksRef.current = updatedTasks
            return updatedTasks
        });
    }

    const prepareTaskData = async () => {
        console.log("------prepare")
        tasksRef.current.forEach(async (task) => {
            if (task.status === 'prepare') {
                let result = await get_m3u_body(task.original.urls)
                updateTaskOriginalUrls(task.id, result)
                updateTaskStatus(task.id, "pending")
            }
        });
    }

    const getM3uBody = (url, timeout) => {
        if (nowMod === 1) {
            return url
        }
        let _timeout = parseInt(timeout, 10)
        return '/fetch/m3u-body?url=' + url + "&timeout=" + (isNaN(_timeout) ? '-1' : _timeout)
    }

    const get_m3u_body = async (data) => {
        let allRequest = [];
        for (let i = 0; i < data.length; i++) {
            let _url = getM3uBody(data[i].url)
            allRequest.push(axios.get(_url, { timeout: 2000 }))
        }
        const results = await Promise.allSettled(allRequest);
        results.forEach((result, index) => {
            let isError = true
            let body = ""
            if (result.status === 'fulfilled') {
                const response = result.value.data;
                if (valid_m3u_file(response)) {
                    isError = false
                    body = response
                } else {
                    isError = true
                    body = response
                }
            } else {
                isError = true
                body = result.reason.message
            }
            if (isError) {
                data[index].status = 500
            } else {
                data[index].status = 200
            }
            data[index].body = body
        })
        return data
    }

    const printData = () => {
        console.log(tasks)

        console.log(taskList)
    }

    const addTask = () => {
        let data = {
            "original": {
                "urls": [
                    {
                        "url": "https://freetv.fun/test_channels_taiwan_new.m3u",
                        "status": 200,
                        "body": `#EXTM3U
    #EXTINF:-1 tvg-name="CCTV5(backup)" tvg-id="378823" tvg-country="中国大陆" tvg-language="国语" tvg-logo="https://epg.pw/media/images/channel/2025/01/25/large/20250125001815951580_60.jpg" group-title="运动",cctv5-体育
    https://stream1.freetv.fun/8c0a0439191a3ba401897378bc2226a7edda1e571cb356ac7c7f4c15f6a2f380.m3u8
    #EXTINF:-1 tvg-name="CCTV5+" tvg-id="378824" tvg-country="中国大陆" tvg-language="国语" tvg-logo="https://epg.pw/media/images/channel/2025/01/25/large/20250125001757126121_81.png" group-title="运动",cctv5 plus
    https://stream1.freetv.fun/0f7997a9c1542d6a120fa0b438502b1d74023e88e38b3555ab20aaa0bf0b591d.m3u8
    #EXTINF:-1 tvg-name="CCTV5+(backup)" tvg-id="378824" tvg-country="中国大陆" tvg-language="国语" tvg-logo="https://epg.pw/media/images/channel/2025/01/25/large/20250125001746078420_25.png" group-title="运动",cctv5 plus
    https://stream1.freetv.fun/5f45303a6d77de9385fd1a97574caa4f005439d3887012b4adf9712be6e8f7e2.m3u8
    #EXTINF:-1 tvg-name="CCTV1" tvg-id="378819" tvg-country="中国大陆" tvg-language="国语" tvg-logo="https://epg.pw/media/images/channel/2025/01/25/large/20250125001359645907_15.png" group-title="综合",cctv1
    https://stream1.freetv.fun/bfec4bae052420b2dd966a77fe7a85446ba81c0436e1582b0bf1fd1a08d4dae6.m3u8
    #EXTINF:-1 tvg-name="CCTV3" tvg-id="378821" tvg-country="中国大陆" tvg-language="国语" tvg-logo="https://epg.pw/media/images/channel/2025/01/25/large/20250125001936710108_56.png" group-title="综艺",cctv3
    https://stream1.freetv.fun/f6e760220823c23e76064af294c797e6a5f5219d492314b02f28a8da361057b4.m3u8
    #EXTINF:-1 tvg-name="CCTV4 FHD" tvg-id="378822" tvg-country="中国大陆" tvg-language="国语" tvg-logo="https://epg.pw/media/images/channel/2025/01/25/large/20250125001917639668_91.png" group-title="新闻",cctv4
    https://stream1.freetv.fun/ce75cb26c3c92bd5f97e003c8bb34c3c3b81be5bfd2e9261d854a5b0f3bbb61a.m3u8`,
                    },
                    {
                        "url": "https://freetv.fun/test_channels_hong_kong_new.m3u",
                        "status": 500,
                        "body": "error",
                    },
                    {
                        "url": "https://freetv.fun/test_channels_china_new.m3u",
                        "status": 500,
                        "body": "error",
                    },
                    {
                        "url": "https://freetv.fun/test_channels_macau_new.m3u",
                        "status": 500,
                        "body": "error",
                    },
                    {
                        "url": "https://freetv.fun/test_channels_singapore_new.m3u",
                        "status": 500,
                        "body": "error",
                    },
                ],
                "keyword_like": [],
                "keyword_dislike": [],
                "http_timeout": 2000,
                "check_timeout": 2000,
                "concurrent": 10,
                "sort": true,
                "no_check": false,
                "rename": true,
                "ffmpeg_check": true,
                "same_save_num": 2,
                "not_http_skip": true
            },
            "id": "6371bc77-373b-4621-83ee-d17330f16be22",
            "create_time": 1743318803,
            "list": [],
            "status": "pending",// prepare now pending completed
            "total": 0,// 总任务数
            "checkCount": 0,// 已检查
            "success": 0,// 成功
            "failed": 0,// 失败
        }

        setTasks(prevItems => {
            let updates = [...prevItems, data]
            saveToLocalStorage(updates, localCahceTasksKey)
            tasksRef.current = updates
            return updates
        });
    }

    return (
        <TaskContext.Provider value={{ tasks, prepareTaskData, printData,addTask }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = React.useContext(TaskContext);
    if (!context) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};