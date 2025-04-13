self.onmessage = async function (e) {
    const { index, nowMod, task } = e.data;
    let result = null
    if(nowMod === 0) {
        result =await checkByWeb(index, task)
    }else if(nowMod === 1) {
        result =await checkByCmd(index, task)
    }
    self.postMessage({ index, task, result });
};

async function checkByWeb(index, task) {
    return {'status':200, "audio": null, "video": null}
}

async function checkByCmd(index, task) {
    return {'status':200, "audio": null, "video": null}
}