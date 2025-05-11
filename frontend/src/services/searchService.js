import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get list of editions
export const getEditions = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/search/editions`, { params });
    return response.data;
  } catch (error) {
    console.error('Failed to get editions:', error);
    throw new Error(error.response?.data?.message || 'Failed to get editions');
  }
};

// Get list of languages
export const getLanguages = async () => {
  try {
    const response = await axios.get(`${API_URL}/search/languages`);
    return response.data;
  } catch (error) {
    console.error('Failed to get languages:', error);
    throw new Error(error.response?.data?.message || 'Failed to get languages');
  }
};

// Get list of types
export const getTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/search/types`);
    return response.data;
  } catch (error) {
    console.error('Failed to get types:', error);
    throw new Error(error.response?.data?.message || 'Failed to get types');
  }
};

// Get list of formats
export const getFormats = async () => {
  try {
    const response = await axios.get(`${API_URL}/search/formats`);
    return response.data;
  } catch (error) {
    console.error('Failed to get formats:', error);
    throw new Error(error.response?.data?.message || 'Failed to get formats');
  }
};

// Get Juz list
export const getJuzList = async () => {
  try {
    const response = await axios.get(`${API_URL}/search/juz`);
    return response.data;
  } catch (error) {
    console.error('Failed to get Juz list:', error);
    throw new Error(error.response?.data?.message || 'Failed to get Juz list');
  }
};

// Get Ruku list for a surah
export const getRukuList = async (surahNumber) => {
  try {
    const response = await axios.get(`${API_URL}/search/ruku/${surahNumber}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get Ruku list:', error);
    throw new Error(error.response?.data?.message || 'Failed to get Ruku list');
  }
};

// Get revelation types
export const getRevelationTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/search/revelation-types`);
    return response.data;
  } catch (error) {
    console.error('Failed to get revelation types:', error);
    throw new Error(error.response?.data?.message || 'Failed to get revelation types');
  }
};

// Search Quran
export const searchQuran = async (query, filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/search/quran`, {
      params: {
        q: query,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to search Quran:', error);
    throw new Error(error.response?.data?.message || 'Failed to search Quran');
  }
};

// Get search suggestions
export const getSearchSuggestions = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search/suggestions`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get search suggestions:', error);
    throw new Error(error.response?.data?.message || 'Failed to get search suggestions');
  }
}; 