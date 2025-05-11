const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const quranApi = require('../services/quranApiService');

// Get all editions
router.get('/editions', async (req, res) => {
    try {
        const result = await quranApi.getEditions(req.query);
        res.json(result);
    } catch (error) {
        console.error('Error fetching editions:', error);
        res.status(500).json({ message: 'Failed to fetch editions' });
    }
});

// Get list of languages
router.get('/languages', async (req, res) => {
    try {
        const result = await quranApi.getLanguages();
        res.json(result);
    } catch (error) {
        console.error('Error fetching languages:', error);
        res.status(500).json({ message: 'Failed to fetch languages' });
    }
});

// Get list of types
router.get('/types', async (req, res) => {
    try {
        const result = await quranApi.getTypes();
        res.json(result);
    } catch (error) {
        console.error('Error fetching types:', error);
        res.status(500).json({ message: 'Failed to fetch types' });
    }
});

// Get list of formats
router.get('/formats', async (req, res) => {
    try {
        const result = await quranApi.getFormats();
        res.json(result);
    } catch (error) {
        console.error('Error fetching formats:', error);
        res.status(500).json({ message: 'Failed to fetch formats' });
    }
});

// Get Juz list
router.get('/juz', async (req, res) => {
    try {
        const juzList = Array.from({ length: 30 }, (_, i) => ({
            number: i + 1,
            name: `Juz ${i + 1}`,
            startSurah: 1, // You may want to add actual start/end surah numbers
            endSurah: 2
        }));
        res.json(juzList);
    } catch (error) {
        console.error('Error fetching juz list:', error);
        res.status(500).json({ message: 'Failed to fetch juz list' });
    }
});

// Get Ruku list for a specific surah
router.get('/ruku/:surahNumber', async (req, res) => {
    try {
        const surahNumber = parseInt(req.params.surahNumber);
        if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
            return res.status(400).json({ message: 'Invalid surah number' });
        }

        const rukuList = Array.from({ length: 10 }, (_, i) => ({
            number: i + 1,
            name: `Ruku ${i + 1}`,
            startAyah: i * 10 + 1,
            endAyah: (i + 1) * 10
        }));
        
        res.json(rukuList);
    } catch (error) {
        console.error('Error fetching ruku list:', error);
        res.status(500).json({ message: 'Failed to fetch ruku list' });
    }
});

// Get revelation types
router.get('/revelation-types', async (req, res) => {
    try {
        // Hardcoded revelation types since they are fixed
        const revelationTypes = ['Meccan', 'Medinan'];
        res.json(revelationTypes);
    } catch (error) {
        console.error('Error fetching revelation types:', error);
        res.status(500).json({ message: 'Failed to fetch revelation types' });
    }
});

// Search the Quran
router.get('/search', async (req, res) => {
    try {
        const { q, surah = 'all', edition = 'en' } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const result = await quranApi.searchQuran(q, surah, edition);
        res.json(result);
    } catch (error) {
        console.error('Error searching Quran:', error);
        res.status(500).json({ message: 'Failed to search Quran' });
    }
});

// Get search suggestions
router.get('/suggestions', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }
        const results = await quranApi.searchQuran(q);
        const suggestions = results.matches?.slice(0, 10).map(result => ({
            text: result.text,
            translation: result.translation
        })) || [];
        res.json(suggestions);
    } catch (error) {
        console.error('Error getting search suggestions:', error);
        res.status(500).json({ message: 'Failed to get search suggestions' });
    }
});

module.exports = router; 