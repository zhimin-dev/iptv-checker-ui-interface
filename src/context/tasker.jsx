import React, { createContext, useEffect, useRef, useState } from 'react';
import axios from "axios"
import ParseM3u from '../utils/utils'
const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
    const [nowMod, setNowMod] = useState(0);// 当前运行模式 0服务端模式 1客户端模式
    const [checkConcurrent, setCheckConcurrent] = useState(4)// 后台任务

    const [tasks, setTasks] = useState([{
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
        "id": "6371bc77-373b-4621-83ee-d17330f16be7",
        "create_time": 1743318803,
        "list":[],
        "status": "pending",
        "total": 0,// 总任务数
        "checkCount":0,// 已检查
        "success": 0,// 成功
        "failed": 0,// 失败
    }]);

    const workersRef = useRef([]);
    const tasksCompleted = useRef(0);

    const saveToLocalStorage = (data) => {
        localStorage.setItem('localTasks', JSON.stringify(data));
    };

    const loadFromLocalStorage = () => {
        const data = localStorage.getItem('localTasks');
        let dataList = []
        if (data) {
            dataList = JSON.parse(data)
            setTasks(dataList);
        }
        fulfilled_data(dataList)
    };

    const m3u8BodyToStructList = (body) => {
        try {
            return ParseM3u.parseOriginalBodyToList(body)
        } catch (e) {
            return []
        }
    }

    const fulfilled_data = (taskList) => {
        for (let i = 0; i < taskList.length; i++) {
            let list = [];
            console.log("task---",taskList[i])
            for (let j = 0; j < taskList[i].original.urls.length; j++) {
               
                if(taskList[i].original.urls[j].status === 200) {
                    let parseDataList = m3u8BodyToStructList(taskList[i].original.urls[j].body)
                    for (let x = 0; x < parseDataList.length; x++) {
                        list.push(parseDataList[x])
                    }
                }
            }
            updateTaskList(taskList[i].id, list)
        }
    }

    const updateTaskList = (taskId, list) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.id === taskId ? { ...task, list } : task
            )
            saveToLocalStorage(updatedTasks)
            return updatedTasks
        });
    };

    useEffect(() => {
        loadFromLocalStorage()

        // 创建一组 Web Workers
        const createWorkers = (count) => {
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

        workersRef.current = createWorkers(checkConcurrent); // 创建N个 worker

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

        console.log("now-task-info", tasks)

        // 清理 Worker
        return () => {
            workersRef.current.forEach(worker => worker.terminate());
        };
    }, []);

    const updateTaskResult = (taskId, result) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.id === taskId ? { ...task, status: 'completed' } : task
            )
            saveToLocalStorage(updatedTasks)
            return updatedTasks
        });
    };

    const updateTaskStatus = (taskId, status) => {
        setTasks(prevTasks => {
            const updatedTasks = prevTasks.map(task =>
                task.id === taskId ? { ...task, status } : task
            )
            saveToLocalStorage(updatedTasks)
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
            saveToLocalStorage(updatedTasks)
            return updatedTasks
        });
    }

    const prepareTaskData = async () => {
        console.log("------prepare")
        tasks.forEach(async (task) => {
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
    }

    return (
        <TaskContext.Provider value={{ tasks, prepareTaskData, printData }}>
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