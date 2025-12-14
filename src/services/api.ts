import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
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
    synthesize: async (text: str, voiceId?: str) => {
        const response = await api.post('/speech/tts', { text, voice_id: voiceId }, {
            responseType: 'blob', // Important for audio playback
        });
        return response.data;
    },
    translate: async (text: str, targetLang: str) => {
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
    merge: async (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        const response = await api.post('/pdf/merge', formData, {
            responseType: 'blob',
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },
    compress: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
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
    }
};

export default api;
