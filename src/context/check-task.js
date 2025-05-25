self.onmessage = async function (e) {
    const { index, nowMod, task } = e.data;
    let result = null
    if(nowMod === 0) {
        result = await checkByWeb(index, task)
    }else if(nowMod === 1) {
        result = await checkByCmd(index, task)
    }
    self.postMessage({ index, task, result });
};

async function checkByWeb(index, task) {
    try {
        // Create AbortController to handle timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        const response = await fetch(task.url, {
            method: 'HEAD',
            signal: controller.signal
        });
        // Check if response is streaming and hasn't completed in time
        if (!response.ok || response.bodyUsed) {
            clearTimeout(timeoutId);
            controller.abort(); // Force abort the ongoing request
            return {
                'status': 500,
                'audio': null,
                'video': null
            };
        }
        
        clearTimeout(timeoutId);

        // Check Content-Type header
        const contentType = response.headers.get('content-type');
        if (!contentType || !(
            contentType.includes('application/vnd.apple.mpegurl') ||
            contentType.includes('application/x-mpegurl') ||
            contentType.includes('audio/mpegurl') ||
            contentType.includes('audio/x-mpegurl') ||
            contentType.includes('text/plain')
        )) {
            return {
                'status': 500,
                'audio': null,
                'video': null
            };
        }else{
            return {
                'status': 200,
                'audio': null,
                'video': null
            };
        }
    } catch (error) {
        // Request failed
        return {
            'status': 500,
            'audio': null,
            'video': null
        };
    }
}

async function checkByCmd(index, task) {
    return checkByWeb(index, task)
}