const API_BASE = 'https://api.alquran.cloud/v1';
const AUDIO_BASE = 'https://the-quran-project.github.io/Quran-Audio/Data';

export const getReciters = async () => {
  return {
    '1': 'Mishary Rashid Al Afasy',
    '2': 'Abu Bakr Al Shatri',
    '3': 'Nasser Al Qatami',
    '4': 'Yasser Al Dosari',
    '5': 'Hani Ar Rifai'
  };
};

export const getAudioUrl = (reciterId, surah, verse) => {
  // Format numbers for the URL
  const formattedSurah = String(surah).padStart(3, '0');
  const formattedVerse = String(verse).padStart(3, '0');
  
  // The format is: https://the-quran-project.github.io/Quran-Audio/Data/1/1_2.mp3
  // where 1 is the reciter ID, and 1_2 represents surah_verse
  return `${AUDIO_BASE}/${reciterId}/${surah}_${verse}.mp3`;
};

// Helper function to calculate absolute verse number
const getAbsoluteVerseNumber = (surah, verse) => {
  // This is a simplified version. In a real app, you'd want to store this data
  const versesBeforeSurah = [
    0,      // Surah 1
    7,      // After Surah 1
    293,    // After Surah 2
    493,    // After Surah 3
    669,    // After Surah 4
    789,    // After Surah 5
    954,    // After Surah 6
    1160,   // After Surah 7
    1235,   // After Surah 8
    1364,   // After Surah 9
    1473,   // After Surah 10
    1596,   // After Surah 11
    1707,   // After Surah 12
    1750,   // After Surah 13
    1802,   // After Surah 14
    1901,   // After Surah 15
    2029,   // After Surah 16
    2140,   // After Surah 17
    2250,   // After Surah 18
    2348,   // After Surah 19
    2483,   // After Surah 20
    2595,   // After Surah 21
    2673,   // After Surah 22
    2791,   // After Surah 23
    2855,   // After Surah 24
    2932,   // After Surah 25
    3159,   // After Surah 26
    3252,   // After Surah 27
    3340,   // After Surah 28
    3409,   // After Surah 29
    3469,   // After Surah 30
    3503,   // After Surah 31
    3533,   // After Surah 32
    3606,   // After Surah 33
    3660,   // After Surah 34
    3705,   // After Surah 35
    3788,   // After Surah 36
    3970,   // After Surah 37
    4058,   // After Surah 38
    4133,   // After Surah 39
    4218,   // After Surah 40
    4272,   // After Surah 41
    4325,   // After Surah 42
    4414,   // After Surah 43
    4473,   // After Surah 44
    4510,   // After Surah 45
    4545,   // After Surah 46
    4583,   // After Surah 47
    4612,   // After Surah 48
    4630,   // After Surah 49
    4675,   // After Surah 50
    4735,   // After Surah 51
    4784,   // After Surah 52
    4846,   // After Surah 53
    4901,   // After Surah 54
    4979,   // After Surah 55
    5075,   // After Surah 56
    5104,   // After Surah 57
    5126,   // After Surah 58
    5150,   // After Surah 59
    5163,   // After Surah 60
    5177,   // After Surah 61
    5188,   // After Surah 62
    5199,   // After Surah 63
    5217,   // After Surah 64
    5229,   // After Surah 65
    5241,   // After Surah 66
    5271,   // After Surah 67
    5323,   // After Surah 68
    5375,   // After Surah 69
    5419,   // After Surah 70
    5447,   // After Surah 71
    5475,   // After Surah 72
    5495,   // After Surah 73
    5551,   // After Surah 74
    5591,   // After Surah 75
    5622,   // After Surah 76
    5672,   // After Surah 77
    5712,   // After Surah 78
    5758,   // After Surah 79
    5800,   // After Surah 80
    5829,   // After Surah 81
    5848,   // After Surah 82
    5884,   // After Surah 83
    5909,   // After Surah 84
    5931,   // After Surah 85
    5948,   // After Surah 86
    5967,   // After Surah 87
    5993,   // After Surah 88
    6023,   // After Surah 89
    6043,   // After Surah 90
    6058,   // After Surah 91
    6079,   // After Surah 92
    6090,   // After Surah 93
    6098,   // After Surah 94
    6106,   // After Surah 95
    6125,   // After Surah 96
    6130,   // After Surah 97
    6138,   // After Surah 98
    6146,   // After Surah 99
    6157,   // After Surah 100
    6168,   // After Surah 101
    6176,   // After Surah 102
    6179,   // After Surah 103
    6188,   // After Surah 104
    6193,   // After Surah 105
    6197,   // After Surah 106
    6204,   // After Surah 107
    6207,   // After Surah 108
    6213,   // After Surah 109
    6216,   // After Surah 110
    6221,   // After Surah 111
    6225,   // After Surah 112
    6230,   // After Surah 113
    6236    // After Surah 114
  ];

  const previousVersesCount = versesBeforeSurah[surah - 1] || 0;
  return previousVersesCount + verse;
};

export const getSurahList = async () => {
  try {
    const response = await fetch(`${API_BASE}/surah`);
    if (!response.ok) throw new Error('Failed to fetch surah list');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching surah list:', error);
    throw error;
  }
};

export const getSurah = async (surahNumber) => {
  try {
    const response = await fetch(`${API_BASE}/surah/${surahNumber}`);
    if (!response.ok) throw new Error('Failed to fetch surah');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching surah:', error);
    throw error;
  }
};

export const getVerse = async (surah, verse) => {
  try {
    // Fetch Arabic text
    const arabicResponse = await fetch(`${API_BASE}/ayah/${surah}:${verse}/ar.alafasy`);
    if (!arabicResponse.ok) throw new Error('Failed to fetch Arabic verse');
    const arabicData = await arabicResponse.json();

    // Fetch English translation
    const englishResponse = await fetch(`${API_BASE}/ayah/${surah}:${verse}/en.sahih`);
    if (!englishResponse.ok) throw new Error('Failed to fetch English translation');
    const englishData = await englishResponse.json();

    // Fetch Urdu translation
    const urduResponse = await fetch(`${API_BASE}/ayah/${surah}:${verse}/ur.jalandhry`);
    if (!urduResponse.ok) throw new Error('Failed to fetch Urdu translation');
    const urduData = await urduResponse.json();

    return {
      arabic1: arabicData.data.text,
      english: englishData.data.text,
      urdu: urduData.data.text,
      surah: surah,
      verse: verse,
      meta: {
        juz: arabicData.data.juz,
        page: arabicData.data.page,
        manzil: arabicData.data.manzil,
        ruku: arabicData.data.ruku,
        hizbQuarter: arabicData.data.hizbQuarter,
      }
    };
  } catch (error) {
    console.error('Error fetching verse:', error);
    throw error;
  }
}; 