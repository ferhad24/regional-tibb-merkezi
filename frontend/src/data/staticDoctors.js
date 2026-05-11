// Backend olmadiqda gosterilen statik fallback verileri.
// Backend qosulduqda real data ile evezlenir.
// Sekiller: Unsplash (pulsuz, medical professional foto-lar)

export const STATIC_DEPARTMENTS = [
  { id: 1, name: 'Kardiologiya', description: 'Ürək və damar xəstəlikləri şöbəsi' },
  { id: 2, name: 'Nevrologiya', description: 'Sinir sistemi xəstəlikləri şöbəsi' },
  { id: 3, name: 'Pediatriya', description: 'Uşaq xəstəlikləri şöbəsi' },
  { id: 4, name: 'Daxili Xəstəliklər', description: 'Daxili orqanların xəstəlikləri şöbəsi' },
];

const photo = (id) =>
  `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&crop=faces&q=80&auto=format`;

// Curated Unsplash doctor photo IDs (white coats, scrubs, stethoscope)
const DOCTOR_PHOTOS = {
  women: [
    '1559839734-2b71ea197ec2', // woman, lab coat
    '1594824476967-48c8b964273f', // woman, scrubs
    '1551601651-2a8555f1a136', // woman doctor
    '1582750433449-648ed127bb54', // woman, stethoscope
    '1638202993928-7267aad84c31', // woman, mask
    '1607746882042-944635dfe10e', // woman, professional
    '1530497610245-94d3c16cda28', // woman, lab coat
    '1614608682850-e0d6ed316d47', // woman doctor
    '1612531386530-97286d97c2d2', // woman doctor
    '1573496359142-b8d87734a5a2', // woman doctor
  ],
  men: [
    '1612349317150-e413f6a5b16d', // man, stethoscope
    '1622253692010-333f2da6031d', // man, scrubs
    '1537368910025-700350fe46c7', // man, lab coat
    '1666214280557-f1b5022eb634', // man, professional
    '1559757175-5700dde675bc', // man doctor
    '1631217872822-1c2546d6b864', // man doctor
    '1551884170-09fb70a3a2ed', // man doctor
    '1606206522398-de6e2bcd2d09', // man doctor
    '1576091160399-112ba8d25d1d', // man, white coat
    '1602233158242-3ba0ac4d2167', // man doctor
  ],
};

export const STATIC_DOCTORS = [
  // Kardiologiya (5)
  { id: 1, fullName: 'Dr. Aysel Məmmədova', specialization: 'Kardioloq, baş həkim',
    bio: '10+ il təcrübəli kardioloq, EKQ və exo-kardioqrafiya üzrə mütəxəssis.',
    departmentId: 1, departmentName: 'Kardiologiya', avatarUrl: photo(DOCTOR_PHOTOS.women[0]) },
  { id: 2, fullName: 'Dr. Nicat Babayev', specialization: 'Kardioloq',
    bio: 'Ürək ritmi pozğunluqları, qan təzyiqi və əməliyyatdan sonrakı reabilitasiya.',
    departmentId: 1, departmentName: 'Kardiologiya', avatarUrl: photo(DOCTOR_PHOTOS.men[0]) },
  { id: 3, fullName: 'Dr. Elnur İsmayılov', specialization: 'İnvaziv kardioloq',
    bio: 'Angiografiya, stent qoyulması və koroner damar müdaxilələri.',
    departmentId: 1, departmentName: 'Kardiologiya', avatarUrl: photo(DOCTOR_PHOTOS.men[1]) },
  { id: 4, fullName: 'Dr. Tahirə Şirinova', specialization: 'Kardioloq-aritmoloq',
    bio: 'Aritmiya, sinkop və holter monitorinqi sahəsində ixtisaslaşıb.',
    departmentId: 1, departmentName: 'Kardiologiya', avatarUrl: photo(DOCTOR_PHOTOS.women[1]) },
  { id: 5, fullName: 'Dr. Vüsal Quliyev', specialization: 'Kardioloq, profilaktika',
    bio: 'Profilaktik müayinələr, xolesterin və qan təzyiqi izləməsi.',
    departmentId: 1, departmentName: 'Kardiologiya', avatarUrl: photo(DOCTOR_PHOTOS.men[2]) },

  // Nevrologiya (3)
  { id: 6, fullName: 'Dr. Rəşid Əliyev', specialization: 'Nevroloq',
    bio: 'Baş ağrıları, miqren və yuxu pozğunluqları üzrə ixtisaslaşıb.',
    departmentId: 2, departmentName: 'Nevrologiya', avatarUrl: photo(DOCTOR_PHOTOS.men[3]) },
  { id: 7, fullName: 'Dr. Səbinə Hacıyeva', specialization: 'Nevroloq, EEG mütəxəssisi',
    bio: 'Epilepsiya, neyropatiya və insult sonrası reabilitasiya.',
    departmentId: 2, departmentName: 'Nevrologiya', avatarUrl: photo(DOCTOR_PHOTOS.women[2]) },
  { id: 8, fullName: 'Dr. Kamran Mustafayev', specialization: 'Nevroloq, baş ağrıları mərkəzi rəhbəri',
    bio: 'Xroniki migren, cluster baş ağrıları və botoks terapiyası.',
    departmentId: 2, departmentName: 'Nevrologiya', avatarUrl: photo(DOCTOR_PHOTOS.men[4]) },

  // Pediatriya (8)
  { id: 9, fullName: 'Dr. Günay Hüseynova', specialization: 'Pediatr',
    bio: 'Yenidoğulmuşdan yeniyetmə yaşa qədər uşaq sağlamlığı.',
    departmentId: 3, departmentName: 'Pediatriya', avatarUrl: photo(DOCTOR_PHOTOS.women[3]) },
  { id: 10, fullName: 'Dr. Murad Quliyev', specialization: 'Pediatr, allerqoloq',
    bio: 'Uşaq allergiyaları, immun sistem və vaksinasiya məsləhəti.',
    departmentId: 3, departmentName: 'Pediatriya', avatarUrl: photo(DOCTOR_PHOTOS.men[5]) },
  { id: 11, fullName: 'Dr. Aytac Rzayeva', specialization: 'Yenidoğulmuş pediatr',
    bio: 'Yenidoğulmuş bakımı, prematür uşaqlar və erkən inkişaf.',
    departmentId: 3, departmentName: 'Pediatriya', avatarUrl: photo(DOCTOR_PHOTOS.women[4]) },
  { id: 12, fullName: 'Dr. Famil Əhmədov', specialization: 'Pediatr-kardioloq',
    bio: 'Uşaqlarda anadangəlmə ürək qüsurları və exo-kardioqrafiya.',
    departmentId: 3, departmentName: 'Pediatriya', avatarUrl: photo(DOCTOR_PHOTOS.men[6]) },
  { id: 13, fullName: 'Dr. Lalə Səfərova', specialization: 'Pediatr, infeksionist',
    bio: 'Uşaq infeksion xəstəlikləri, hepatit və ümumi viral xəstəliklər.',
    departmentId: 3, departmentName: 'Pediatriya', avatarUrl: photo(DOCTOR_PHOTOS.women[5]) },
  { id: 14, fullName: 'Dr. Orxan Bayramov', specialization: 'Pediatr-nevroloq',
    bio: 'Uşaq epilepsiyası, beyin inkişafı və hərəkət pozğunluqları.',
    departmentId: 3, departmentName: 'Pediatriya', avatarUrl: photo(DOCTOR_PHOTOS.men[7]) },
  { id: 15, fullName: 'Dr. Zərifə Cəfərli', specialization: 'Pediatr-endokrinoloq',
    bio: 'Uşaq diabeti, böyümə hormonu və tiroid xəstəlikləri.',
    departmentId: 3, departmentName: 'Pediatriya', avatarUrl: photo(DOCTOR_PHOTOS.women[6]) },
  { id: 16, fullName: 'Dr. Tural Kərimov', specialization: 'Pediatr',
    bio: 'Ümumi pediatrik müayinə, profilaktik baxış və inkişaf izləməsi.',
    departmentId: 3, departmentName: 'Pediatriya', avatarUrl: photo(DOCTOR_PHOTOS.men[8]) },

  // Daxili Xəstəliklər (4)
  { id: 17, fullName: 'Dr. Elvin Quliyev', specialization: 'Daxili Xəstəliklər mütəxəssisi',
    bio: 'Hipertenziya, diabet və mədə-bağırsaq xəstəlikləri.',
    departmentId: 4, departmentName: 'Daxili Xəstəliklər', avatarUrl: photo(DOCTOR_PHOTOS.men[9]) },
  { id: 18, fullName: 'Dr. Lalə Cəfərova', specialization: 'Endokrinoloq',
    bio: 'Tiroid, diabet və hormonal balans pozğunluqları.',
    departmentId: 4, departmentName: 'Daxili Xəstəliklər', avatarUrl: photo(DOCTOR_PHOTOS.women[7]) },
  { id: 19, fullName: 'Dr. Sənan Əliyev', specialization: 'Qastroenteroloq',
    bio: 'Mədə xorası, qastrit, qaraciyər xəstəlikləri və endoskopiya.',
    departmentId: 4, departmentName: 'Daxili Xəstəliklər', avatarUrl: photo(DOCTOR_PHOTOS.men[0]) },
  { id: 20, fullName: 'Dr. Nigar Hüseynova', specialization: 'Pulmonoloq',
    bio: 'Astma, bronxit və tənəffüs yolu xəstəlikləri.',
    departmentId: 4, departmentName: 'Daxili Xəstəliklər', avatarUrl: photo(DOCTOR_PHOTOS.women[8]) },
];
