import React, { createContext, useContext, useState, useEffect,useRef } from 'react';
import axios from "axios"
import ParseM3u from '../utils/utils'
import { TaskStorageService } from '../services/taskStorageService';

const TaskContext = createContext();

export const useTask = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
};

export const TaskProvider = ({ children }) => {
    const [nowMod, setNowMod] = useState(0);// 当前运行模式 0服务端模式 1客户端模式
    const [checkConcurrent, setCheckConcurrent] = useState(4)// 后台任务
    const [nowTaskId, setNowTaskId] = useState("")// 正在执行的任务id
    const [taskList, setTaskList] = useState([])// 正在执行的任务列表

    const [tasks, setTasks] = useState([]);
    const [runningTasks, setRunningTasks] = useState(new Set());

    const workersRef = useRef([]);// worker ref
    const tasksCompletedRef = useRef(0);// 完成的任务数 ref
    const taskListRef = useRef([])// 当前正在运行的任务列表 ref
    const nowTaskIdRef = useRef("")//当前正在进行的任务id ref
    const tasksRef = useRef([]);//全部任务ref
    const taskRef = useRef(null);//任务ref

    const localCahceTasksKey = "local_tasks"
    const localCahceNowTaskId = "nowTaskId"
    const localCahceNowTaskList = "nowTaskList"

    const saveToLocalStorage = (data, key) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // 从localstorage加载数据
    const loadFromLocalStorage = () => {
        let tasks = TaskStorageService.getTasks();
        tasksRef.current = tasks;
        updateTasks(tasks);

        const nowTaskId = localStorage.getItem(localCahceNowTaskId);
        if (nowTaskId !== '') {
            updateNowTaskId(nowTaskId, false);
        } else {
            updateNowTaskId("", false);
        }

        const taskList = localStorage.getItem(localCahceNowTaskList);
        if (taskList) {
            updateTaskList(JSON.parse(taskList));
        } else {
            updateTaskList([]);
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

    const getDataBody = (urls) => {
        return [
            {
                'status': 200,
                'body':`#EXTM3U
#EXTINF:-1 tvg-name="CCTV5(backup)" tvg-id="378823" tvg-country="中国大陆" tvg-language="国语" tvg-logo="https://epg.pw/media/images/channel/2025/01/25/large/20250125001815951580_60.jpg" group-title="运动",cctv5-体育
https://stream1.freetv.fun/8c0a0439191a3ba401897378bc2226a7edda1e571cb356ac7c7f4c15f6a2f380.m3u8`
            }
        ]
        // return []
    }

    const fulfilled_data = (tList) => {
        for (let i = 0; i < tList.length; i++) {
            let list = [];
            let bodys = [];
            if(tList[i].original.urls.length > 0) {
                bodys =  getDataBody(tList[i].original.urls)
            }
            for (let j = 0; j < bodys.length; j++) {
                if (bodys[j].status === 200) {
                    let parseDataList = m3u8BodyToStructList(bodys[j].body)
                    for (let x = 0; x < parseDataList.length; x++) {
                        list.push(parseDataList[x])
                    }
                }
            }
            console.log("fulfilled_data---", list)
            updateTaskInfo(tList[i].id, list)
        }
    }

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
        setTasks(list);
        saveToLocalStorage(list, localCahceTasksKey);
        tasksRef.current = list;
    };

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
        console.log("task list ----",taskListRef.current)
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
                if (tasksRef.current[i].task_info.task_status.toLowerCase() === 'pending' && nowId === '' && tasksRef.current[i].id !== tempNowTaskId) {
                    nowId = tasksRef.current[i].id
                    tList = tasksRef.current[i].list
                }
            }
            console.log("----- task list reset", nowId, tList)
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
        console.log("updateTaskListResult---", index, passTask, result)
        setTaskList(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.index === index ? { 
                    ...task, 
                    status: result['status'] 
                } : task
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

    // const prepareTaskData = async () => {
    //     console.log("------prepare")
    //     tasksRef.current.forEach(async (task) => {
    //         if (task.status === 'prepare') {
    //             let result = await get_m3u_body(task.original.urls)
    //             updateTaskOriginalUrls(task.id, result)
    //             updateTaskStatus(task.id, "pending")
    //         }
    //     });
    // }

    // const getM3uBody = (url, timeout) => {
    //     if (nowMod === 1) {
    //         return url
    //     }
    //     let _timeout = parseInt(timeout, 10)
    //     return '/fetch/m3u-body?url=' + url + "&timeout=" + (isNaN(_timeout) ? '-1' : _timeout)
    // }

    // const get_m3u_body = async (data) => {
    //     let allRequest = [];
    //     for (let i = 0; i < data.length; i++) {
    //         let _url = getM3uBody(data[i].url)
    //         allRequest.push(axios.get(_url, { timeout: 2000 }))
    //     }
    //     const results = await Promise.allSettled(allRequest);
    //     results.forEach((result, index) => {
    //         let isError = true
    //         let body = ""
    //         if (result.status === 'fulfilled') {
    //             const response = result.value.data;
    //             if (valid_m3u_file(response)) {
    //                 isError = false
    //                 body = response
    //             } else {
    //                 isError = true
    //                 body = response
    //             }
    //         } else {
    //             isError = true
    //             body = result.reason.message
    //         }
    //         if (isError) {
    //             data[index].status = 500
    //         } else {
    //             data[index].status = 200
    //         }
    //         data[index].body = body
    //     })
    //     return data
    // }

    // const printData = () => {
    //     console.log(tasks)

    //     console.log(taskList)
    // }

    // 检查单个任务
    const checkTask = async (taskId) => {
        console.log("checkTask", taskId);
        if (runningTasks.has(taskId)) {
            console.log(`Task ${taskId} is already running`);
            return;
        }

        try {
            // 标记任务为运行中
            setRunningTasks(prev => new Set([...prev, taskId]));
            
            // 更新任务状态
            const task = tasks.find(t => t.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            // 更新任务信息
            const updatedTask = {
                ...task,
                task_info: {
                    ...task.task_info,
                    is_running: true,
                    task_status: "Running",
                    last_run_time: Date.now()
                }
            };

            // 保存更新后的任务
            TaskStorageService.updateTask(taskId, updatedTask);
            setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));

            // 执行任务检查逻辑
            await performTaskCheck(task);

            // 更新任务完成状态
            const completedTask = {
                ...updatedTask,
                task_info: {
                    ...updatedTask.task_info,
                    is_running: false,
                    task_status: "Completed",
                    next_run_time: 0
                }
            };

            TaskStorageService.updateTask(taskId, completedTask);
            setTasks(prev => prev.map(t => t.id === taskId ? completedTask : t));
        } catch (error) {
            console.error(`Error checking task ${taskId}:`, error);
            
            // 更新任务错误状态
            const failedTask = {
                ...task,
                task_info: {
                    ...task.task_info,
                    is_running: false,
                    task_status: "Failed"
                }
            };

            TaskStorageService.updateTask(taskId, failedTask);
            setTasks(prev => prev.map(t => t.id === taskId ? failedTask : t));
        } finally {
            // 移除运行中标记
            setRunningTasks(prev => {
                const newSet = new Set(prev);
                newSet.delete(taskId);
                return newSet;
            });
        }
    };

    // 执行任务检查的具体逻辑
    const performTaskCheck = async (task) => {
        // TODO: 实现具体的任务检查逻辑
        // 这里可以添加检查URL、处理文件等具体实现
        return new Promise((resolve) => {
            console.log("performTaskCheck", task)
            setTimeout(resolve, 2000); // 模拟检查过程
        });
    };

    const value = {
        tasks,
        runningTasks,
        checkTask
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};