// Backend olmadiqda gosterilen statik fallback verileri.
// Backend qosulduqda real data ile evezlenir.

export const STATIC_DEPARTMENTS = [
  { id: 1, name: 'Kardiologiya', description: 'Ürək və damar xəstəlikləri şöbəsi' },
  { id: 2, name: 'Nevrologiya', description: 'Sinir sistemi xəstəlikləri şöbəsi' },
  { id: 3, name: 'Pediatriya', description: 'Uşaq xəstəlikləri şöbəsi' },
  { id: 4, name: 'Daxili Xəstəliklər', description: 'Daxili orqanların xəstəlikləri şöbəsi' },
];

export const STATIC_DOCTORS = [
  {
    id: 1,
    fullName: 'Dr. Aysel Məmmədova',
    specialization: 'Kardioloq, baş həkim',
    bio: '10+ il təcrübəli kardioloq, EKQ və exo-kardioqrafiya üzrə mütəxəssis.',
    departmentId: 1,
    departmentName: 'Kardiologiya',
  },
  {
    id: 2,
    fullName: 'Dr. Nicat Babayev',
    specialization: 'Kardioloq',
    bio: 'Ürək ritmi pozğunluqları, qan təzyiqi və əməliyyatdan sonrakı reabilitasiya.',
    departmentId: 1,
    departmentName: 'Kardiologiya',
  },
  {
    id: 3,
    fullName: 'Dr. Rəşid Əliyev',
    specialization: 'Nevroloq',
    bio: 'Baş ağrıları, miqren və yuxu pozğunluqları üzrə ixtisaslaşıb.',
    departmentId: 2,
    departmentName: 'Nevrologiya',
  },
  {
    id: 4,
    fullName: 'Dr. Səbinə Hacıyeva',
    specialization: 'Nevroloq, EEG mütəxəssisi',
    bio: 'Epilepsiya, neyropatiya və insult sonrası reabilitasiya.',
    departmentId: 2,
    departmentName: 'Nevrologiya',
  },
  {
    id: 5,
    fullName: 'Dr. Günay Hüseynova',
    specialization: 'Pediatr',
    bio: 'Yenidoğulmuşdan yeniyetmə yaşa qədər uşaq sağlamlığı.',
    departmentId: 3,
    departmentName: 'Pediatriya',
  },
  {
    id: 6,
    fullName: 'Dr. Murad Quliyev',
    specialization: 'Pediatr, allerqoloq',
    bio: 'Uşaq allergiyaları, immun sistem və vaksinasiya məsləhəti.',
    departmentId: 3,
    departmentName: 'Pediatriya',
  },
  {
    id: 7,
    fullName: 'Dr. Elvin Quliyev',
    specialization: 'Daxili Xəstəliklər mütəxəssisi',
    bio: 'Hipertenziya, diabet və mədə-bağırsaq xəstəlikləri.',
    departmentId: 4,
    departmentName: 'Daxili Xəstəliklər',
  },
  {
    id: 8,
    fullName: 'Dr. Lalə Cəfərova',
    specialization: 'Endokrinoloq',
    bio: 'Tiroid, diabet və hormonal balans pozğunluqları.',
    departmentId: 4,
    departmentName: 'Daxili Xəstəliklər',
  },
];
