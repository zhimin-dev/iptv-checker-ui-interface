import axios from 'axios';

export class ApiTaskService {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    async getTaskList() {
        const response = await axios.get(`${this.baseUrl}/tasks/list?page=1`);
        return response.data;
    }

    async uploadFile(formData) {
        const response = await axios.post(`${this.baseUrl}/media/upload`, formData,{
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log("response---", response.data);
        return response.data;
    }

    async getReplaceList() {
        const response = await axios.get(`${this.baseUrl}/system/replace`);
        if (response.status !== 200) { 
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async updateReplaceList(replaceList) {
        const response = await axios.post(`${this.baseUrl}/system/replace`, replaceList);
        if (response.status !== 200) {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async addTask(taskData) {
        const response = await axios.post(`${this.baseUrl}/tasks/add`, taskData);
        if (response.data.code !== "200") {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async updateTask(taskId, taskData) {
        const response = await axios.post(`${this.baseUrl}/tasks/update?task_id=${taskId}`, taskData);
        if (response.data.code !== "200") {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async deleteTask(taskId) {
        const response = await axios.delete(`${this.baseUrl}/tasks/delete/${taskId}`);
        if (response.data.code !== "200") {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async runTask(taskId) {
        const response = await axios.get(`${this.baseUrl}/tasks/run?task_id=${taskId}`);
        return response.data;
    }

    // async getDownloadBody(taskId) {
    //     const response = await axios.get(`${this.baseUrl}/tasks/get-download-body?task_id=${taskId}`);
    //     return response.data;
    // }

    // async getTaskContent(taskId, host) {
    //     const response = await axios.get(`${this.baseUrl}/tasks/get-task-content`, {
    //         params: { task_id: taskId, host }
    //     });
    //     return response.data;
    // }

    async getTaskDetail(taskId) {
        const response = await axios.get(`${this.baseUrl}/tasks/detail`, {
            params: { task_id: taskId }
        });
        return response.data;
    }

    // async exportTasks() {
    //     const response = await axios.get(`${this.baseUrl}/system/tasks/export`);
    //     return response.data;
    // }

    // async importTasks(tasksData) {
    //     const response = await axios.post(`${this.baseUrl}/system/tasks/import`, tasksData);
    //     return response.data;
    // }

    async getBaseConfig() {
        const response = await axios.get(`${this.baseUrl}/system/base-config`);
        if (response.status !== 200) {
            throw new Error(response.data?.msg || 'get base-config failed');
        }
        return response.data;
    }

    async saveBaseConfig(data) {
        const response = await axios.post(`${this.baseUrl}/system/base-config`, data);
        if (response.status !== 200) {
            throw new Error(response.data?.msg || 'save base-config failed');
        }
        return response.data;
    }

    async getNetworkConfig() {
        const response = await axios.get(`${this.baseUrl}/system/network-config`);
        if (response.status !== 200) {
            throw new Error(response.data?.msg || 'get network-config failed');
        }
        return response.data;
    }

    async saveNetworkConfig(data) {
        const response = await axios.post(`${this.baseUrl}/system/network-config`, data);
        if (response.status !== 200) {
            throw new Error(response.data?.msg || 'save network-config failed');
        }
        return response.data;
    }

    async getSearchConfig() {
        const response = await axios.get(`${this.baseUrl}/system/info`);
        if (response.status !== 200) {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async updateSearchConfig(config) {
        const response = await axios.post(`${this.baseUrl}/system/global-config`, config);
        if (response.status !== 200) {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async runSpider() {
        const response = await axios.post(`${this.baseUrl}/system/spider/run`);
        return response.data;
    }

    async getSpiderStatus() {
        const response = await axios.get(`${this.baseUrl}/system/spider/status`);
        return response.data;
    }

    async getTodayFiles() {
        const response = await axios.get(`${this.baseUrl}/system/list-today-files`);
        return response.data;
    }

    async clearSearchFolder() {
        const response = await axios.get(`${this.baseUrl}/system/clear-search-folder`);
        return response.data;
    }

    async initSearchData() {
        const response = await axios.get(`${this.baseUrl}/system/init-search-data`);
        return response.data;
    }

    async getFavourite() {
        const response = await axios.get(`${this.baseUrl}/system/get-favourite`);
        return response.data;
    }

    async saveFavourite(data) {
        const response = await axios.post(`${this.baseUrl}/system/save-favourite`, data);
        return response.data;
    }

    async getSearchHistory(keyword, limit, page, pageSize) {
        const response = await axios.get(`${this.baseUrl}/api/player/search-history`, {
            params: {
                keyword: keyword || '',
                limit: limit || 20,
                page: page || 0,
                page_size: pageSize || 20,
            },
        });
        return response.data;
    }

    async openUrl(url) {
        const response = await axios.get(url);
        return response.data;
    }

    async getChannelLogos() {
        const response = await axios.get(`${this.baseUrl}/media/logos`);
        return response.data;
    }

    async getLogosConfig() {
        const response = await axios.get(`${this.baseUrl}/system/channel-logos`);
        return response.data;
    }

    async uploadLogos(formData) {
        const response = await axios.post(`${this.baseUrl}/media/upload-logos`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async updateLogo(data) {
        const response = await axios.post(`${this.baseUrl}/media/logos/update`, data);
        return response.data;
    }

    async saveChannelLogos(data) {
        const response = await axios.post(`${this.baseUrl}/system/channel-logos`, data);
        return response.data;
    }

    async saveChannelLogosConfig(data) {
        const response = await axios.post(`${this.baseUrl}/media/logos/config`, data);
        return response.data;
    }

    async exportConfig() {
        const response = await axios.get(`${this.baseUrl}/system/export`);
        return response.data;
    }

    async importConfig(formData) {
        const response = await axios.post(`${this.baseUrl}/system/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async getEpgSources() {
        const response = await axios.get(`${this.baseUrl}/epg/sources`);
        return response.data;
    }

    async saveEpgSources(data) {
        const response = await axios.post(`${this.baseUrl}/epg/sources`, data);
        return response.data;
    }

    async getEpgByChannel(channel) {
        const response = await axios.get(`${this.baseUrl}/epg`, {
            params: { channel }
        });
        return response.data;
    }

    async getEpgChannelList() {
        const response = await axios.get(`${this.baseUrl}/epg/channel-list`);
        return response.data;
    }

    /** 立即更新 EPG：POST /epg/sync（与后端不一致时改此处） */
    async refreshEpg() {
        const response = await axios.post(`${this.baseUrl}/epg/sync`, {});
        return response.data;
    }

    /** 清除已爬取的 EPG 缓存：GET /epg/cache */
    async clearEpgCache() {
        const response = await axios.get(`${this.baseUrl}/epg/cache`);
        return response.data;
    }

    async getGroupMapping() {
        const response = await axios.get(`${this.baseUrl}/system/group-mapping`);
        return response.data;
    }

    async saveGroupMapping(data) {
        const response = await axios.post(`${this.baseUrl}/system/group-mapping`, data);
        return response.data;
    }

    async getUnmappedEpgChannels() {
        const response = await axios.get(`${this.baseUrl}/system/group-mapping/unmapped`);
        return response.data;
    }

    // ---------- 播放历史 / 搜索历史（后台管理） ----------

    async getPlayHistory(keyword, playable, page, pageSize) {
        const response = await axios.get(`${this.baseUrl}/api/player/play-history`, {
            params: {
                keyword: keyword || '',
                playable: playable === undefined ? '' : (playable ? '1' : '0'),
                page: page || 0,
                page_size: pageSize || 20,
            },
        });
        return response.data;
    }

    async deletePlayHistory(id) {
        const response = await axios.delete(`${this.baseUrl}/api/player/play-history/${id}`);
        return response.data;
    }

    async clearPlayHistory() {
        const response = await axios.delete(`${this.baseUrl}/api/player/play-history`);
        return response.data;
    }

    async deleteSearchHistory(name) {
        const response = await axios.delete(`${this.baseUrl}/api/player/search-history/${encodeURIComponent(name)}`);
        return response.data;
    }

    async clearSearchHistory() {
        const response = await axios.delete(`${this.baseUrl}/api/player/search-history`);
        return response.data;
    }

    // ---------- 检查黑名单 ----------

    async getBlacklist(page, pageSize) {
        const response = await axios.get(`${this.baseUrl}/api/check/blacklist`, {
            params: { page: page || 0, page_size: pageSize || 50 },
        });
        return response.data;
    }

    async clearBlacklist() {
        const response = await axios.delete(`${this.baseUrl}/api/check/blacklist`);
        return response.data;
    }

    async getBlacklistConfig() {
        const response = await axios.get(`${this.baseUrl}/api/check/blacklist/config`);
        return response.data;
    }

    async setBlacklistConfig(data) {
        const response = await axios.post(`${this.baseUrl}/api/check/blacklist/config`, data);
        return response.data;
    }

    // ---------- 流畅模式（中继会话） ----------

    async getRelayList() {
        const response = await axios.get(`${this.baseUrl}/api/player/relay`);
        return response.data;
    }

    async stopRelay(sid) {
        const response = await axios.delete(`${this.baseUrl}/api/player/relay/${sid}`);
        return response.data;
    }

    async startRelay(url) {
        // manual: true —— 后台手动添加的会话永不自动停止，需手动停止
        const response = await axios.post(`${this.baseUrl}/api/player/relay/start`, { url, manual: true });
        return response.data;
    }

    async getRelayConfig() {
        const response = await axios.get(`${this.baseUrl}/api/player/relay/config`);
        return response.data;
    }

    async getSnapshots(urls, refresh, existingOnly) {
        const response = await axios.post(`${this.baseUrl}/api/player/snapshots`, {
            urls,
            refresh: !!refresh,
            existing_only: !!existingOnly,
        });
        return response.data;
    }

    async setRelayConfig(data) {
        const response = await axios.post(`${this.baseUrl}/api/player/relay/config`, data);
        return response.data;
    }

    // ---------- 播放器频道 / 快照 / EPG 文件 ----------

    async getPlayerChannels(source, refresh) {
        const response = await axios.get(`${this.baseUrl}/api/player/channels`, {
            params: { source: source || 'checked', refresh: refresh ? '1' : undefined },
        });
        return response.data;
    }

    async getSnapshotsConfig() {
        const response = await axios.get(`${this.baseUrl}/api/player/snapshots/config`);
        return response.data;
    }

    async setSnapshotsConfig(enabled) {
        const response = await axios.post(`${this.baseUrl}/api/player/snapshots/config`, { enabled });
        return response.data;
    }

    async getSnapshots(urls, refresh) {
        const response = await axios.post(`${this.baseUrl}/api/player/snapshots`, { urls, refresh: !!refresh });
        return response.data;
    }

    async getEpgFiles() {
        const response = await axios.get(`${this.baseUrl}/api/epg/files`);
        return response.data;
    }

    async getEpgFileContent(name) {
        const response = await axios.get(`${this.baseUrl}/api/epg/files/content`, {
            params: { name },
        });
        return response.data;
    }

    // ---------- 爬取的频道封面 ----------

    // ---------- 收藏频道（播放器收藏） ----------

    async getFavouriteChannels(page, pageSize) {
        const response = await axios.get(`${this.baseUrl}/api/player/favourites`, {
            params: { page: page || 0, page_size: pageSize || 20 },
        });
        return response.data;
    }

    async removeFavouriteChannel(id) {
        const response = await axios.delete(`${this.baseUrl}/api/player/favourites/${id}`);
        return response.data;
    }

    // 请求桌面端播放指定频道
    async sendPlayRequest(name, url) {
        const response = await axios.post(`${this.baseUrl}/api/player/play-request`, { name, url });
        return response.data;
    }

    async getCrawledLogos() {
        const response = await axios.get(`${this.baseUrl}/media/logos-crawled`);
        return response.data;
    }

    async bindCrawledLogos(ids, names) {
        const response = await axios.post(`${this.baseUrl}/media/logos-crawled/bind`, { ids, names });
        return response.data;
    }

    async deleteCrawledLogo(id) {
        const response = await axios.delete(`${this.baseUrl}/media/logos-crawled/${id}`);
        return response.data;
    }

    async clearCrawledLogos() {
        const response = await axios.delete(`${this.baseUrl}/media/logos-crawled`);
        return response.data;
    }
}