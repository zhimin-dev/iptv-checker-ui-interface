import React, { createContext, useEffect, useRef, useState } from 'react';
import axios from "axios"
const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [nowMod, setNowMod] = useState(0);// 当前运行模式 0服务端模式 1客户端模式

    const [tasks, setTasks] = useState([{
        "original": {
            "urls": [
                {
                    "url":"https://freetv.fun/test_channels_taiwan_new.m3u",
                    "status":0,
                    "body":"",
                },
                {
                    "url":"https://freetv.fun/test_channels_hong_kong_new.m3u",
                    "status":0,
                    "body":"",
                },
                {
                    "url":"https://freetv.fun/test_channels_china_new.m3u",
                    "status":0,
                    "body":"",
                },
                {
                    "url":"https://freetv.fun/test_channels_macau_new.m3u",
                    "status":0,
                    "body":"",
                },
                {
                    "url":"https://freetv.fun/test_channels_singapore_new.m3u",
                    "status":0,
                    "body":"",
                },
            ],
            "result_name": "",
            "md5": "b0708bf0a89dca5d01d220922964cd4f",
            "run_type": "",
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
        "id": "6371bc77-373b-4621-83ee-d17330f16be7",
        "create_time": 1743318803,
        "status":"prepare",
        "result":0,
        "bodies":[],
    }]);

    const workersRef = useRef([]);
    const tasksCompleted = useRef(0);

    useEffect(() => {
        // 创建一组 Web Workers
        const createWorkers = (count) => {
            console.log("-----create worker")
            const workers = [];
            for (let i = 0; i < count; i++) {
                const worker = new Worker(new URL('./check-task.js', import.meta.url));
                worker.onmessage = (e) => {
                    const { taskId, result } = e.data;
                    updateTaskResult(taskId, result);
                };
                workers.push(worker);
            }
            return workers;
        };

        workersRef.current = createWorkers(4); // 创建四个 worker

        // 开始处理每个任务
        const processTasks = () => {
            tasks.forEach(task => {
                if (task.status === 'pending') {
                    const worker = workersRef.current[tasksCompleted.current % workersRef.current.length];
                    worker.postMessage({ taskId: task.id, data: task.original }); // 发送任务信息
                    tasksCompleted.current++;
                }
            });
        };

        processTasks();

        console.log("now-task-info",tasks)

        // 清理 Worker
        return () => {
            workersRef.current.forEach(worker => worker.terminate());
        };
    }, [tasks]);

    const updateTaskResult = (id, result) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, status: 'completed', result } : task
            )
        );
    };

    const updateTaskStatus = (id, status) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, status } : task
            )
        );
    };

    const updateTaskOriginalUrls = (id, data) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, original:{
                    ... task.original,
                    urls: data
                } } : task
            )
        );
    }

    const prepareTaskData = async () => {
        console.log("------prepare")
        tasks.forEach(async(task) => {
            if (task.status === 'prepare') {
                let result = await get_m3u_body(task.original.urls)
                console.log("----preparedata", result)
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

    return (
        <TaskContext.Provider value={{ tasks,prepareTaskData }}>
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