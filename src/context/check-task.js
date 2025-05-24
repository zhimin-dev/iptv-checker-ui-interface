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
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const content = await response.text();
        
        // Check if content matches m3u8 format
        if (content.trim().startsWith('#EXTM3U')) {
            // Valid m3u8 file
            return {
                'status': 200,
                'audio': null,
                'video': null
            };
        } else {
            // Not a valid m3u8 file
            return {
                'status': 500,
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