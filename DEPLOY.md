# Deploy Təlimatı: Vercel + Render + Neon

Layihə 3 hissəyə bölünür və hər biri ayrı pulsuz hostda işləyir.

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│ Vercel          │ ───▶ │ Render           │ ───▶ │ Neon         │
│ (React SPA)     │ HTTP │ (Spring Boot)    │ JDBC │ (PostgreSQL) │
└─────────────────┘      └──────────────────┘      └──────────────┘
```

Sıra: **1) Neon → 2) Render → 3) Vercel** (çünki frontend backend URL-ni bilməlidir).

---

## 1. Neon — PostgreSQL bazası (5 dəq)

1. https://neon.tech açıb GitHub ilə daxil ol
2. **Create project** → ad: `regional-tibb-merkezi`, region: yaxın bölgə (Frankfurt EU)
3. Yaranan səhifədə **Connection string** kopyala. Belə görünür:
   ```
   postgresql://username:password@ep-xxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Bu string-i bir kənarda saxla — Render üçün lazım olacaq

> Neon URL-ni JDBC formatına çevirmək lazımdır: `postgresql://` əvəzinə `jdbc:postgresql://` yazılır və user/password URL-dən ayrı götürülür. Aşağıda Render addımında dəqiq göstərilib.

---

## 2. Render — Spring Boot backend (10 dəq)

### Yaratmaq

1. https://render.com açıb GitHub ilə daxil ol
2. **New +** → **Web Service** → GitHub repo seç: `ferhad24/regional-tibb-merkezi`
3. Konfiqurasiya:
   - **Name**: `regional-tibb-merkezi-api`
   - **Region**: Frankfurt (Neon ilə eyni)
   - **Branch**: `main`
   - **Root Directory**: `medical-center`
   - **Runtime**: **Docker** (Dockerfile avtomatik tapılacaq)
   - **Instance Type**: **Free**

### Environment Variables

`Environment` tab-ında bunları əlavə et:

| Açar | Dəyər | İzah |
|------|-------|------|
| `DATABASE_URL` | `jdbc:postgresql://ep-xxx.aws.neon.tech/neondb?sslmode=require` | Neon URL — `postgresql://` → `jdbc:postgresql://` və user:password çıxarılır |
| `DATABASE_USERNAME` | `your_neon_user` | Neon URL-dən |
| `DATABASE_PASSWORD` | `your_neon_password` | Neon URL-dən |
| `JWT_SECRET` | (32+ baytlıq base64 random) | Aşağıda generasiya əmri var |
| `CORS_ORIGINS` | `https://regional-tibb-merkezi.vercel.app` | Hələ Vercel URL-i bilməyəndə dəyər: `*` qoy, sonra dəyişərsən |
| `ADMIN_PASSWORD` | (admin üçün gizli şifrə) | İlk seed üçün |

**Yeni JWT_SECRET generasiyası** (lokal terminalda):
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
```

4. **Create Web Service** bas → 5-10 dəq build gözlə
5. Tamamlandıqda yuxarıda URL görəcəksən: `https://regional-tibb-merkezi-api.onrender.com`
6. Test et: brauzerdə aç `https://...onrender.com/api/public/departments` → JSON görməlisən

> **Free tier qeydi**: Render-də backend 15 dəq passiv qaldıqdan sonra yatır. Növbəti istifadədə ilk sorğu ~30 san gec gəlir (cold start). Bunu istifadəçilərə "ilk açılış 30 san çəkir" kimi qeyd etmək olar.

### Neon URL-ni JDBC-yə çevirmək — nümunə

Neon: `postgresql://alice:p4ss@ep-cool-snow-12345.aws.neon.tech/neondb?sslmode=require`

Render env-ə:
- `DATABASE_URL` = `jdbc:postgresql://ep-cool-snow-12345.aws.neon.tech/neondb?sslmode=require`
- `DATABASE_USERNAME` = `alice`
- `DATABASE_PASSWORD` = `p4ss`

---

## 3. Vercel — React frontend (3 dəq)

1. https://vercel.com açıb GitHub ilə daxil ol
2. **Add New** → **Project** → GitHub repo import: `ferhad24/regional-tibb-merkezi`
3. Konfiqurasiya:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ⚠️ (**vacib** — Edit basıb dəyişdir)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
4. **Environment Variables** bölməsində:
   - Açar: `VITE_API_BASE_URL`
   - Dəyər: `https://regional-tibb-merkezi-api.onrender.com/api` (Render URL + `/api`)
5. **Deploy** bas → 1-2 dəq
6. Tamamlandıqda Vercel sənə URL verəcək: `https://regional-tibb-merkezi.vercel.app`

---

## 4. CORS-u qapamaq (vacib təhlükəsizlik)

Vercel URL-ni bildikdən sonra Render-ə qayıt:
- `Environment` tab → `CORS_ORIGINS` dəyərini `*`-dan dəqiq URL-ə dəyiş:
  ```
  CORS_ORIGINS=https://regional-tibb-merkezi.vercel.app
  ```
- **Save Changes** → Render avtomatik yenidən deploy edəcək

---

## 5. Yoxlama

Vercel URL-i aç:
```
https://regional-tibb-merkezi.vercel.app
```

İlk açılışda 30 saniyə gözləmə ola bilər (Render cold start). Sonra:
- Şöbələr və həkimlər siyahısı görünməlidir
- `admin` / `admin123` ilə daxil olub admin paneli yoxlayın
- Yeni xəstə qeydiyyatı, növbə təyini, ləğv et — hamısı işləməlidir

---

## Tipik problemlər

| Problem | Səbəb / Həll |
|---------|--------------|
| Frontend "ECONNREFUSED" və ya "Network Error" | Render backend hələ qalxmayıb (cold start). 30 san gözlə və yenilə |
| "CORS error" konsolda | `CORS_ORIGINS` env Vercel URL-i ilə uyğun deyil. Render-də yenilə və redeploy |
| Login işləmir, "401 Unauthorized" | JWT_SECRET dəyişdirsən, köhnə tokenlər keçərsiz olur. Logout edib yenidən login ol |
| Build "out of memory" Render-də | Free tier 512MB RAM. Dockerfile-də `-Xmx256m` əlavə et: `ENTRYPOINT ["java", "-Xmx256m", "-jar", "/app/app.jar"]` |
| Neon "too many connections" | Free tier 100 connection limit. Sonra HikariCP pool size azalt: `spring.datasource.hikari.maximum-pool-size=5` (application.properties-ə əlavə et) |

---

## Pulsuz tier məhdudiyyətləri

- **Vercel**: 100GB bandwidth/ay, 1 CI/CD/min, qeyri-kommersial
- **Render**: 750 saat/ay, 15 dəq passiv → yatır, 512MB RAM, 0.5 CPU
- **Neon**: 0.5GB storage, 100 saat compute/ay, automatic suspend

Portfolio və demo üçün tamamilə yetərlidir.
