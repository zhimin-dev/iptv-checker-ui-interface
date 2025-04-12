self.onmessage = function (e) {
    const { taskId, data } = e.data;
    const result = performTask(data); // 假设performTask是你的任务逻辑
    self.postMessage({ taskId, result });
};

function performTask(data) {
    // 在这里执行任务的逻辑
    // let sum = 0;
    // for (let i = 0; i < data; i++) {
    //     sum += i;
    //     console.log("----",new Date())
    // }
    return 2; // 返回结果
}