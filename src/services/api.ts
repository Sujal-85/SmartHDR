import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

const baseURL = `${API_BASE_URL}/api`;
console.log("DEBUG: API Base URL is:", baseURL);

const api = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const ocrAPI = {
    extractText: async (file: File, mode: 'standard' | 'high_accuracy') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', mode);

        const response = await api.post('/ocr/extract', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export const speechAPI = {
    transcribe: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/speech/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    synthesize: async (text: string, voiceId?: string) => {
        const response = await api.post('/speech/tts', { text, voice_id: voiceId }, {
            responseType: 'blob', // Important for audio playback
        });
        return response.data;
    },
    translate: async (text: string, targetLang: string) => {
        const response = await api.post('/speech/translate', { text, target_lang: targetLang });
        return response.data;
    }
};

export const mathAPI = {
    solve: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/math/solve', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};

export const sketchAPI = {
    vectorize: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/sketch/vectorize', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            responseType: 'text', // Expect SVG text response
        });
        return response.data;
    }
};

export const pdfAPI = {
    merge: async (files: File[], useAPI: boolean = false) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("use_api", useAPI.toString());
        const response = await api.post('/pdf/merge', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    compress: async (file: File, useAPI: boolean = false) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("use_api", useAPI.toString());
        const response = await api.post('/pdf/compress', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    split: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post('/pdf/split', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    imageToPDF: async (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        const response = await api.post('/pdf/image-to-pdf', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    convert: async (file: File, task: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("task", task);
        const response = await api.post('/pdf/convert', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    unlock: async (file: File, password?: string) => {
        const formData = new FormData();
        formData.append("file", file);
        if (password) formData.append("password", password);
        const response = await api.post('/pdf/unlock', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    rotate: async (file: File, rotation: number = 90) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("rotate", rotation.toString());
        const response = await api.post('/pdf/rotate', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    protect: async (file: File, password: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("password", password);
        const response = await api.post('/pdf/protect', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    redact: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post('/pdf/redact', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    }
};

export const historyAPI = {
    getHistory: async (type?: string) => {
        const response = await api.get(`/history/${type ? `?type=${type}` : ""}`);
        return response.data;
    },
    deleteHistory: async (id: string) => {
        const response = await api.delete(`/history/${id}`);
        return response.data;
    }
};

export default api;
