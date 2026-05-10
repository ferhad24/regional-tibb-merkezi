# Regional Tibb Mərkəzi

Xəstə qeydiyyatı və onlayn növbə təyini sistemi. **Spring Boot REST API + React SPA + JWT** arxitekturası.

> 🚀 **Deploy etmək üçün**: [DEPLOY.md](DEPLOY.md) — Vercel + Render + Neon (3-tərəfli pulsuz hosting)

## Texnologiyalar

**Backend** (`medical-center/`):
- Java 21, Spring Boot 3.4.1
- Spring Security 6 + JWT (JJWT 0.12)
- Spring Data JPA + Hibernate
- PostgreSQL 14+
- Lombok, Bean Validation

**Frontend** (`frontend/`):
- React 18, Vite 6
- React Router 6
- Axios (JWT interceptor ilə)
- Bootstrap 5.3 + Bootstrap Icons

## Tələblər

- JDK 21
- Maven 3.9+ (və ya istənilən IDE-də quraşdırılmış)
- Node.js 18+ (npm 9+)
- PostgreSQL 14+

## İlkin qurğu

### 1. PostgreSQL bazası

```bash
psql -U postgres -c "CREATE DATABASE medical_center;"
```

(və ya pgAdmin-də əl ilə yaradın)

Default DB ayarları (`medical-center/src/main/resources/application.properties`):
- URL: `jdbc:postgresql://localhost:5432/medical_center`
- User: `postgres`
- Password: `postgres`

Fərqli istifadə edirsinizsə, faylı redaktə edin.

### 2. Backend işə sal

```bash
cd medical-center
mvn spring-boot:run
```

Backend `http://localhost:8080`-də işləyəcək. İlk açılışda avtomatik:
- Default admin: **`admin / admin123`**
- 4 şöbə: Kardiologiya, Nevrologiya, Pediatriya, Daxili Xəstəliklər
- Hər şöbəyə 1 nümunə həkim

### 3. Frontend işə sal

Yeni terminal açın:

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173`-də açılacaq. Brauzeri açın və başlayın.

## API endpoint-ləri (qısa siyahı)

| Metod | URL | Açıqlama | Auth |
|-------|-----|----------|------|
| POST | `/api/auth/register` | Yeni xəstə qeydiyyatı | Public |
| POST | `/api/auth/login` | Login → JWT | Public |
| GET | `/api/auth/me` | Cari istifadəçi | Bearer |
| GET | `/api/public/departments` | Şöbələr | Public |
| GET | `/api/public/doctors` | Həkimlər (filter: `?departmentId=N`) | Public |
| GET | `/api/public/doctors/{id}` | Həkim detalı | Public |
| GET | `/api/appointments/available-slots?doctorId=&date=` | Boş slotlar | Bearer |
| GET | `/api/appointments/me` | Mənim növbələrim | Patient |
| POST | `/api/appointments` | Yeni növbə | Patient |
| POST | `/api/appointments/{id}/cancel` | Növbəni ləğv et | Patient |
| GET | `/api/admin/stats` | İstatistika | Admin |
| GET, POST, PUT, DELETE | `/api/admin/doctors[/{id}]` | Həkim CRUD | Admin |
| GET, POST, DELETE | `/api/admin/departments[/{id}]` | Şöbə CRUD | Admin |
| GET | `/api/admin/appointments` | Bütün növbələr | Admin |
| POST | `/api/admin/appointments/{id}/cancel` | Admin ləğv | Admin |

## Arxitektura

```
medical-center/                     # Spring Boot REST API
├── src/main/java/az/medical/center/
│   ├── MedicalCenterApplication.java
│   ├── config/                     # Security, JWT filter, seed, exception handler
│   ├── entity/                     # User, Doctor, Department, Appointment, enums
│   ├── repository/                 # JPA repositories
│   ├── service/                    # Business logic
│   ├── dto/                        # Request/response DTOs
│   └── controller/                 # REST endpoints (Auth, Public, Appointment, Admin)
├── src/main/resources/
│   └── application.properties
└── pom.xml

frontend/                           # React SPA
├── src/
│   ├── main.jsx                    # Entry, Bootstrap import
│   ├── App.jsx                     # Routes
│   ├── api/client.js               # axios + JWT interceptor
│   ├── auth/                       # AuthContext, ProtectedRoute
│   ├── components/                 # Navbar, Layout, Alert
│   └── pages/                      # Home, Login, Register, Dashboard, Book + admin/*
├── vite.config.js                  # /api proxy → :8080
└── package.json
```

## İstifadə axını

1. `http://localhost:5173/` — anonim səhifə, həkimlər siyahısı
2. `Növbəyə yaz` → login-ə yönləndirir → qeydiyyat keçin
3. Daxil olduqdan sonra dashboard-a düşürsünüz
4. Həkim seçin, tarix seçin, mövcud slotlardan birini seçin, təsdiqləyin
5. Dashboard-da növbənizi görür və lazım gəldikdə ləğv edə bilirsiniz
6. `admin / admin123` ilə daxil olub Admin Panel-i istifadə edin

## Vacib qeydlər

- **JWT secret**: `application.properties`-də `app.jwt.secret` dev üçün hardcoded-dur. Prod-da mütləq dəyişin (ən az 32 byte, base64).
- **CORS**: Default olaraq yalnız `http://localhost:5173` icazəlidir. Başqa origin-dən qoşulursunuzsa `app.cors.allowed-origins`-ə əlavə edin.
- **Vaxt slotları**: 09:00–17:00 arası 30-dəq slotlar; eyni gün üçün keçmiş saatlar avtomatik filterdən keçir.
- **Şifrə**: BCrypt ilə hash olunur, plaintext heç vaxt saxlanmır.
- **Race condition**: Eyni slotu eyni anda iki nəfər bron etsə, DB unique constraint birini rədd edir və dostluq mesajı qaytarılır.
