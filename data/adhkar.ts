import { PrayerName, AdhkarItem } from '../types';

const commonAdhkar: AdhkarItem[] = [
  { text: 'أَسْتَغْفِرُ اللّٰهَ', count: 3, note: 'يقال ثلاث مرات' },
  { text: 'اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالْإِكْرَامِ', count: 1, note: '' },
  { text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ', count: 1, note: '' },
  { text: 'سُبْحَانَ اللّٰهِ', count: 33, note: '' },
  { text: 'الْحَمْدُ لِلّٰهِ', count: 33, note: '' },
  { text: 'اللّٰهُ أَكْبَرُ', count: 33, note: '' },
  { text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 1, note: 'تمام المائة' },
  { text: 'قراءة آية الكرسي', count: 1, note: 'بعد كل صلاة مكتوبة' },
];

const fardSpecificAdhkar: { [key in Exclude<PrayerName, 'Duha'>]?: AdhkarItem[] } = {
  Fajr: [
    { text: 'قراءة سورة الإخلاص والمعوذتين', count: 3, note: 'ثلاث مرات' },
  ],
  Maghrib: [
    { text: 'قراءة سورة الإخلاص والمعوذتين', count: 3, note: 'ثلاث مرات' },
  ],
  Dhuhr: [
    { text: 'قراءة سورة الإخلاص والمعوذتين', count: 1, note: 'مرة واحدة' },
  ],
  Asr: [
    { text: 'قراءة سورة الإخلاص والمعوذتين', count: 1, note: 'مرة واحدة' },
  ],
  Isha: [
    { text: 'قراءة سورة الإخلاص والمعوذتين', count: 1, note: 'مرة واحدة' },
  ],
};


export const getAdhkarForPrayer = (prayerName: PrayerName): AdhkarItem[] => {
    if (prayerName === 'Duha') return [];
    const specific = fardSpecificAdhkar[prayerName] || [];
    return [...commonAdhkar, ...specific];
};
