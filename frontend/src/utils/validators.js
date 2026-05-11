// Form yoxlamalar - hamisi azerbaycanca mesaj qaytarir.
// Return null === xeta yoxdur, string === xeta mesaji.

export const validateUsername = (v) => {
  const t = (v || '').trim();
  if (!t) return 'İstifadəçi adı boş ola bilməz';
  if (t.length < 3) return 'İstifadəçi adı ən azı 3 simvol olmalıdır';
  if (t.length > 50) return 'İstifadəçi adı 50 simvoldan uzun ola bilməz';
  if (!/^[a-zA-Z0-9._-]+$/.test(t)) {
    return 'Yalnız hərf, rəqəm, nöqtə, alt xətt və defis istifadə olunur';
  }
  return null;
};

export const validatePassword = (v) => {
  const t = v || '';
  if (!t) return 'Şifrə boş ola bilməz';
  if (t.length < 6) return 'Şifrə ən azı 6 simvol olmalıdır';
  if (t.length > 100) return 'Şifrə 100 simvoldan uzun ola bilməz';
  if (!/[A-Za-zƏəÇçĞğİıÖöŞşÜü]/.test(t) || !/\d/.test(t)) {
    return 'Şifrədə həm hərf, həm də rəqəm olmalıdır';
  }
  return null;
};

export const validateLoginPassword = (v) => {
  const t = v || '';
  if (!t) return 'Şifrə boş ola bilməz';
  if (t.length < 6) return 'Şifrə ən azı 6 simvol olmalıdır';
  return null;
};

export const validateConfirmPassword = (v, original) => {
  if (!v) return 'Şifrəni təkrar daxil edin';
  if (v !== original) return 'Şifrələr uyğun gəlmir';
  return null;
};

export const validateFullName = (v) => {
  const t = (v || '').trim();
  if (!t) return 'Tam adınızı yazın';
  if (t.length < 3) return 'Tam ad ən azı 3 simvol olmalıdır';
  if (t.length > 120) return 'Tam ad çox uzundur';
  if (!/^[A-Za-zƏəÇçĞğİıÖöŞşÜü\s.'-]+$/.test(t)) {
    return 'Tam adda yalnız hərf və boşluq ola bilər';
  }
  return null;
};

export const validateEmail = (v) => {
  const t = (v || '').trim();
  if (!t) return 'E-poçt boş ola bilməz';
  if (t.length > 120) return 'E-poçt çox uzundur';
  // RFC sade pattern
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) {
    return 'Düzgün e-poçt ünvanı daxil edin (məs. ad@domain.com)';
  }
  return null;
};

export const validatePhone = (v) => {
  const t = (v || '').trim();
  if (!t || t === '+994') return 'Telefon nömrəsi boş ola bilməz';
  if (!/^\+994\d{9}$/.test(t)) {
    return '+994 sonra 9 rəqəm olmalıdır (məs. +994501234567)';
  }
  return null;
};
