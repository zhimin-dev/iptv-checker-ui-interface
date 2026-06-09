import axios from 'axios';
import { resolveAbsoluteUrl } from '../utils/api';

export class ApiTaskService {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    async resolveUrl(path) {
        return await resolveAbsoluteUrl(path, this.baseUrl);
    }

    async get(path, config) {
        return await axios.get(await this.resolveUrl(path), config);
    }

    async post(path, data, config) {
        return await axios.post(await this.resolveUrl(path), data, config);
    }

    async delete(path, config) {
        return await axios.delete(await this.resolveUrl(path), config);
    }

    async getTaskList() {
        const response = await this.get('/tasks/list?page=1');
        return response.data;
    }

    async uploadFile(formData) {
        const response = await this.post('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log("response---", response.data);
        return response.data;
    }

    async getReplaceList() {
        const response = await this.get('/system/replace');
        if (response.status !== 200) { 
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async updateReplaceList(replaceList) {
        const response = await this.post('/system/replace', replaceList);
        if (response.status !== 200) {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async addTask(taskData) {
        const response = await this.post('/tasks/add', taskData);
        if (response.data.code !== "200") {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async updateTask(taskId, taskData) {
        const response = await this.post(`/tasks/update?task_id=${taskId}`, taskData);
        if (response.data.code !== "200") {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async deleteTask(taskId) {
        const response = await this.delete(`/tasks/delete/${taskId}`);
        if (response.data.code !== "200") {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async runTask(taskId) {
        const response = await this.get(`/tasks/run?task_id=${taskId}`);
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
        const response = await this.get('/tasks/detail', {
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
        const response = await this.get('/system/base-config');
        if (response.status !== 200) {
            throw new Error(response.data?.msg || 'get base-config failed');
        }
        return response.data;
    }

    async saveBaseConfig(data) {
        const response = await this.post('/system/base-config', data);
        if (response.status !== 200) {
            throw new Error(response.data?.msg || 'save base-config failed');
        }
        return response.data;
    }

    async getSearchConfig() {
        const response = await this.get('/system/info');
        if (response.status !== 200) {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async updateSearchConfig(config) {
        const response = await this.post('/system/global-config', config);
        if (response.status !== 200) {
            throw new Error(response.data.msg);
        }
        return response.data;
    }

    async runSpider() {
        const response = await this.post('/system/spider/run');
        return response.data;
    }

    async getSpiderStatus() {
        const response = await this.get('/system/spider/status');
        return response.data;
    }

    async getTodayFiles() {
        const response = await this.get('/system/list-today-files');
        return response.data;
    }

    async clearSearchFolder() {
        const response = await this.get('/system/clear-search-folder');
        return response.data;
    }

    async initSearchData() {
        const response = await this.get('/system/init-search-data');
        return response.data;
    }

    async getFavourite() {
        const response = await this.get('/system/get-favourite');
        return response.data;
    }

    async saveFavourite(data) {
        const response = await this.post('/system/save-favourite', data);
        return response.data;
    }

    async openUrl(url) {
        const response = await this.get(url);
        return response.data;
    }

    async getChannelLogos() {
        const response = await this.get('/media/logos');
        return response.data;
    }

    async getLogosConfig() {
        const response = await this.get('/system/channel-logos');
        return response.data;
    }

    async uploadLogos(formData) {
        const response = await this.post('/media/upload-logos', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async updateLogo(data) {
        const response = await this.post('/media/logos/update', data);
        return response.data;
    }

    async saveChannelLogos(data) {
        const response = await this.post('/system/channel-logos', data);
        return response.data;
    }

    async saveChannelLogosConfig(data) {
        const response = await this.post('/media/logos/config', data);
        return response.data;
    }

    async exportConfig() {
        const response = await this.get('/system/export');
        return response.data;
    }

    async importConfig(formData) {
        const response = await this.post('/system/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async getEpgSources() {
        const response = await this.get('/epg/sources');
        return response.data;
    }

    async saveEpgSources(data) {
        const response = await this.post('/epg/sources', data);
        return response.data;
    }

    async getEpgByChannel(channel) {
        const response = await this.get('/epg', {
            params: { channel }
        });
        return response.data;
    }

    async getEpgChannelList() {
        const response = await this.get('/epg/channel-list');
        return response.data;
    }

    /** 立即更新 EPG：POST /epg/sync（与后端不一致时改此处） */
    async refreshEpg() {
        const response = await this.post('/epg/sync', {});
        return response.data;
    }

    /** 清除已爬取的 EPG 缓存：GET /epg/cache */
    async clearEpgCache() {
        const response = await this.get('/epg/cache');
        return response.data;
    }
}