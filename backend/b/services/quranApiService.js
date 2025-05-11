const axios = require('axios');

const BASE_URL = 'http://api.alquran.cloud/v1';

const quranApi = {
    // Edition related endpoints
    async getEditions(params = {}) {
        const { format, language, type } = params;
        let url = `${BASE_URL}/edition`;
        if (format || language || type) {
            const queryParams = new URLSearchParams();
            if (format) queryParams.append('format', format);
            if (language) queryParams.append('language', language);
            if (type) queryParams.append('type', type);
            url += `?${queryParams.toString()}`;
        }
        const response = await axios.get(url);
        return response.data;
    },

    async getLanguages() {
        const response = await axios.get(`${BASE_URL}/edition/language`);
        return response.data;
    },

    async getTypes() {
        const response = await axios.get(`${BASE_URL}/edition/type`);
        return response.data;
    },

    async getFormats() {
        const response = await axios.get(`${BASE_URL}/edition/format`);
        return response.data;
    },

    // Quran content endpoints
    async getJuz(juzNumber, edition = 'quran-uthmani') {
        const response = await axios.get(`${BASE_URL}/juz/${juzNumber}/${edition}`);
        return response.data;
    },

    async getSurah(surahNumber, edition = 'quran-uthmani') {
        const response = await axios.get(`${BASE_URL}/surah/${surahNumber}/${edition}`);
        return response.data;
    },

    async getRuku(rukuNumber, edition = 'quran-uthmani') {
        const response = await axios.get(`${BASE_URL}/ruku/${rukuNumber}/${edition}`);
        return response.data;
    },

    async searchQuran(keyword, surah = 'all', edition = 'en') {
        const response = await axios.get(`${BASE_URL}/search/${keyword}/${surah}/${edition}`);
        return response.data;
    },

    async getAyah(reference, edition = 'quran-uthmani') {
        const response = await axios.get(`${BASE_URL}/ayah/${reference}/${edition}`);
        return response.data;
    },

    async getMeta() {
        const response = await axios.get(`${BASE_URL}/meta`);
        return response.data;
    }
};

module.exports = quranApi; 