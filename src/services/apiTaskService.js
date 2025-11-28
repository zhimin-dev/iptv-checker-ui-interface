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

    async getDownloadBody(taskId) {
        const response = await axios.get(`${this.baseUrl}/tasks/get-download-body?task_id=${taskId}`);
        return response.data;
    }

    async exportTasks() {
        const response = await axios.get(`${this.baseUrl}/system/tasks/export`);
        return response.data;
    }

    async importTasks(tasksData) {
        const response = await axios.post(`${this.baseUrl}/system/tasks/import`, tasksData);
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
} 