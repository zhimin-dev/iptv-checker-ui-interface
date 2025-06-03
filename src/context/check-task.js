self.onmessage = async function (e) {
    const { index, nowMod, task, original } = e.data;
    let result = null
    if(nowMod === 0) {
        result = await checkByWeb(index, task, original)
    }else if(nowMod === 1) {
        result = await checkByCmd(index, task, original)
    }
    self.postMessage({ index, task, result });
};

async function checkByWeb(index, task, originalData) {
    try {
        // Create AbortController to handle timeout
        const controller = new AbortController();
        let timeout  = 20000
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(task.url, {
            method: 'HEAD',
            signal: controller.signal,
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
            contentType.includes('text/plain') ||
            contentType.includes('application/x-mpegURL') ||
            contentType.includes('application/vnd.apple.mpegURL')
        )) {
            return {
                'status': 500,
                'audio': null,
                'video': null,
                'contentType': contentType
            };
        }else{
            return {
                'status': 200,
                'audio': null,
                'video': null,
                'contentType': contentType
            };
        }
    } catch (error) {
        // Request failed
        return {
            'status': 500,
            'audio': null,
            'video': null,
            'contentType': ""
        };
    }
}

async function checkByCmd(index, task, originalData) {
    return checkByWeb(index, task, originalData)
}