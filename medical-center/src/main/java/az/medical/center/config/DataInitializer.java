package az.medical.center.config;

import az.medical.center.entity.Department;
import az.medical.center.entity.Doctor;
import az.medical.center.entity.QuickFeedback;
import az.medical.center.entity.Review;
import az.medical.center.entity.Role;
import az.medical.center.entity.User;
import az.medical.center.repository.DepartmentRepository;
import az.medical.center.repository.DoctorRepository;
import az.medical.center.repository.ReviewRepository;
import az.medical.center.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final PlatformTransactionManager transactionManager;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.email}")
    private String adminEmail;

    private static final Map<String, String> DEPT_DESC = new LinkedHashMap<>();
    static {
        DEPT_DESC.put("Kardiologiya", "Ürək və damar xəstəlikləri şöbəsi");
        DEPT_DESC.put("Nevrologiya", "Sinir sistemi xəstəlikləri şöbəsi");
        DEPT_DESC.put("Pediatriya", "Uşaq xəstəlikləri şöbəsi");
        DEPT_DESC.put("Daxili Xəstəliklər", "Daxili orqanların xəstəlikləri şöbəsi");
    }

    // randomuser.me — cinsiyyət uyğun real portretlər (zəmanətli)
    private static String womanImg(int idx) {
        return "https://randomuser.me/api/portraits/women/" + idx + ".jpg";
    }

    private static String manImg(int idx) {
        return "https://randomuser.me/api/portraits/men/" + idx + ".jpg";
    }

    @Override
    public void run(String... args) {
        // Hər seed öz tranzaksiyasında — biri uğursuz olsa digərləri davam edir.
        TransactionTemplate tt = new TransactionTemplate(transactionManager);

        safe(tt, "seedAdmin",        this::seedAdmin);
        safe(tt, "seedExtraAdmins",  this::seedExtraAdmins);

        @SuppressWarnings("unchecked")
        Map<String, Department>[] deptsHolder = new Map[1];
        safe(tt, "ensureDepartments", () -> deptsHolder[0] = ensureDepartments());

        if (deptsHolder[0] != null) {
            safe(tt, "seedDoctors", () -> seedDoctors(deptsHolder[0]));
        }

        @SuppressWarnings("unchecked")
        List<User>[] patientsHolder = new List[1];
        safe(tt, "seedDemoPatients", () -> patientsHolder[0] = seedDemoPatients());

        if (patientsHolder[0] != null) {
            safe(tt, "seedDemoReviews", () -> seedDemoReviews(patientsHolder[0]));
        }
    }

    private void safe(TransactionTemplate tt, String name, Runnable action) {
        try {
            tt.executeWithoutResult(status -> action.run());
            log.info("Seed step '{}' OK", name);
        } catch (Exception e) {
            log.error("Seed step '{}' FAILED: {}", name, e.getMessage());
        }
    }

    // Sabit admin hesabları — username = email, şifrələr DataInitializer-dən sinxron olur
    private static final String[][] EXTRA_ADMINS = {
            {"nurgulyunusova03@gmail.com", "Nurgül Yunusova", "Nurgül1234"},
            {"fekopro49@gmail.com",        "Ferhad Namazov",  "Ferhad1234"},
    };

    private void seedExtraAdmins() {
        for (String[] row : EXTRA_ADMINS) {
            String username = row[0];
            String fullName = row[1];
            String rawPassword = row[2];

            User u = userRepository.findByUsername(username).orElse(null);
            String mode;
            if (u == null) {
                if (userRepository.existsByEmail(username)) {
                    log.warn("Admin seed SKIPPED for {}: email already used by another user", username);
                    continue;
                }
                u = new User();
                u.setUsername(username);
                u.setEmail(username);
                u.setPhone("+994000000000");
                mode = "created";
            } else {
                mode = "updated";
                if (u.getEmail() == null || u.getEmail().isBlank() || u.getEmail().equals(username)) {
                    u.setEmail(username);
                }
            }
            u.setPassword(passwordEncoder.encode(rawPassword));
            u.setFullName(fullName);
            u.setRole(Role.ROLE_ADMIN);
            u.setEnabled(true);
            try {
                User saved = userRepository.save(u);
                boolean matches = passwordEncoder.matches(rawPassword, saved.getPassword());
                log.info("Admin '{}' {} (id={}, role={}, enabled={}, passwordMatchesSeed={}, rawLen={})",
                        username, mode, saved.getId(), saved.getRole(), saved.isEnabled(),
                        matches, rawPassword.length());
            } catch (Exception ex) {
                log.error("Admin save FAILED for {}: {}", username, ex.toString());
            }
        }
    }

    private void seedAdmin() {
        if (userRepository.existsByUsername(adminUsername)) return;

        User admin = User.builder()
                .username(adminUsername)
                .password(passwordEncoder.encode(adminPassword))
                .fullName("Sistem Administratoru")
                .email(adminEmail)
                .phone("+994000000000")
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();
        userRepository.save(admin);
    }

    private Map<String, Department> ensureDepartments() {
        Map<String, Department> result = new LinkedHashMap<>();
        int order = 1;
        for (String name : DEPT_DESC.keySet()) {
            final int currentOrder = order++;
            Department d = departmentRepository.findByNameIgnoreCase(name)
                    .map(existing -> {
                        if (existing.getDisplayOrder() == null
                                || existing.getDisplayOrder() != currentOrder) {
                            existing.setDisplayOrder(currentOrder);
                            return departmentRepository.save(existing);
                        }
                        return existing;
                    })
                    .orElseGet(() -> departmentRepository.save(
                            Department.builder()
                                    .name(name)
                                    .description(DEPT_DESC.get(name))
                                    .displayOrder(currentOrder)
                                    .build()
                    ));
            result.put(name, d);
        }
        return result;
    }

    private void seedDoctors(Map<String, Department> depts) {
        List<DoctorSeed> seeds = List.of(
                // Kardiologiya (5)
                d("Dr. Aysel Məmmədova", "Kardioloq, baş həkim",
                        "10+ il təcrübəli kardioloq, EKQ və exo-kardioqrafiya üzrə mütəxəssis.",
                        "Kardiologiya", womanImg(12)),
                d("Dr. Nicat Babayev", "Kardioloq",
                        "Ürək ritmi pozğunluqları, qan təzyiqi və əməliyyatdan sonrakı reabilitasiya.",
                        "Kardiologiya", manImg(31)),
                d("Dr. Elnur İsmayılov", "İnvaziv kardioloq",
                        "Angiografiya, stent qoyulması və koroner damar müdaxilələri.",
                        "Kardiologiya", manImg(45)),
                d("Dr. Tahirə Şirinova", "Kardioloq-aritmoloq",
                        "Aritmiya, sinkop və holter monitorinqi sahəsində ixtisaslaşıb.",
                        "Kardiologiya", womanImg(24)),
                d("Dr. Vüsal Quliyev", "Kardioloq, profilaktika",
                        "Profilaktik müayinələr, xolesterin və qan təzyiqi izləməsi.",
                        "Kardiologiya", manImg(52)),

                // Nevrologiya (3)
                d("Dr. Rəşid Əliyev", "Nevroloq",
                        "Baş ağrıları, miqren və yuxu pozğunluqları üzrə ixtisaslaşıb.",
                        "Nevrologiya", manImg(67)),
                d("Dr. Səbinə Hacıyeva", "Nevroloq, EEG mütəxəssisi",
                        "Epilepsiya, neyropatiya və insult sonrası reabilitasiya.",
                        "Nevrologiya", womanImg(33)),
                d("Dr. Kamran Mustafayev", "Nevroloq, baş ağrıları mərkəzi rəhbəri",
                        "Xroniki migren, cluster baş ağrıları və botoks terapiyası.",
                        "Nevrologiya", manImg(78)),

                // Pediatriya (8)
                d("Dr. Günay Hüseynova", "Pediatr",
                        "Yenidoğulmuşdan yeniyetmə yaşa qədər uşaq sağlamlığı.",
                        "Pediatriya", womanImg(44)),
                d("Dr. Murad Quliyev", "Pediatr, allerqoloq",
                        "Uşaq allergiyaları, immun sistem və vaksinasiya məsləhəti.",
                        "Pediatriya", manImg(15)),
                d("Dr. Aytac Rzayeva", "Yenidoğulmuş pediatr",
                        "Yenidoğulmuş bakımı, prematür uşaqlar və erkən inkişaf.",
                        "Pediatriya", womanImg(56)),
                d("Dr. Famil Əhmədov", "Pediatr-kardioloq",
                        "Uşaqlarda anadangəlmə ürək qüsurları və exo-kardioqrafiya.",
                        "Pediatriya", manImg(83)),
                d("Dr. Lalə Səfərova", "Pediatr, infeksionist",
                        "Uşaq infeksion xəstəlikləri, hepatit və ümumi viral xəstəliklər.",
                        "Pediatriya", womanImg(68)),
                d("Dr. Orxan Bayramov", "Pediatr-nevroloq",
                        "Uşaq epilepsiyası, beyin inkişafı və hərəkət pozğunluqları.",
                        "Pediatriya", manImg(11)),
                d("Dr. Zərifə Cəfərli", "Pediatr-endokrinoloq",
                        "Uşaq diabeti, böyümə hormonu və tiroid xəstəlikləri.",
                        "Pediatriya", womanImg(75)),
                d("Dr. Tural Kərimov", "Pediatr",
                        "Ümumi pediatrik müayinə, profilaktik baxış və inkişaf izləməsi.",
                        "Pediatriya", manImg(26)),

                // Daxili Xəstəliklər (4)
                d("Dr. Elvin Quliyev", "Daxili Xəstəliklər mütəxəssisi",
                        "Hipertenziya, diabet və mədə-bağırsaq xəstəlikləri.",
                        "Daxili Xəstəliklər", manImg(38)),
                d("Dr. Lalə Cəfərova", "Endokrinoloq",
                        "Tiroid, diabet və hormonal balans pozğunluqları.",
                        "Daxili Xəstəliklər", womanImg(85)),
                d("Dr. Sənan Əliyev", "Qastroenteroloq",
                        "Mədə xorası, qastrit, qaraciyər xəstəlikləri və endoskopiya.",
                        "Daxili Xəstəliklər", manImg(59)),
                d("Dr. Nigar Hüseynova", "Pulmonoloq",
                        "Astma, bronxit və tənəffüs yolu xəstəlikləri.",
                        "Daxili Xəstəliklər", womanImg(20))
        );

        for (DoctorSeed s : seeds) {
            String experience = experienceFor(s.deptName, s.specialization);
            String education = educationFor(s.deptName);
            Optional<Doctor> existing = doctorRepository.findByFullName(s.fullName);
            if (existing.isPresent()) {
                Doctor d = existing.get();
                d.setSpecialization(s.specialization);
                d.setBio(s.bio);
                d.setAvatarUrl(s.avatarUrl);
                d.setDepartment(depts.get(s.deptName));
                if (d.getExperience() == null || d.getExperience().isBlank()) {
                    d.setExperience(experience);
                }
                if (d.getEducation() == null || d.getEducation().isBlank()) {
                    d.setEducation(education);
                }
                doctorRepository.save(d);
            } else {
                doctorRepository.save(Doctor.builder()
                        .fullName(s.fullName)
                        .specialization(s.specialization)
                        .bio(s.bio)
                        .experience(experience)
                        .education(education)
                        .avatarUrl(s.avatarUrl)
                        .department(depts.get(s.deptName))
                        .build());
            }
        }
    }

    private static String experienceFor(String deptName, String spec) {
        return switch (deptName) {
            case "Kardiologiya" -> "• Mərkəzi Klinik Xəstəxana — Kardiologiya şöbəsi (2014–2020)\n"
                    + "• Respublika Diaqnostika Mərkəzi — " + spec + " (2020–indiyə qədər)\n"
                    + "• 1500+ EKQ və exo-kardioqrafiya müayinəsi\n"
                    + "• Avropa Kardiologiya Cəmiyyətinin (ESC) üzvü";
            case "Nevrologiya" -> "• Bakı Şəhər Klinik Xəstəxanası — Nevrologiya şöbəsi (2013–2019)\n"
                    + "• MediRegSys — " + spec + " (2019–indiyə qədər)\n"
                    + "• EEG, EMG və neyrosonologiya üzrə 1200+ müayinə\n"
                    + "• Beynəlxalq Baş Ağrıları Cəmiyyətinin (IHS) üzvü";
            case "Pediatriya" -> "• Uşaq Klinik Xəstəxanası N.2 — Pediatriya şöbəsi (2015–2021)\n"
                    + "• MediRegSys Uşaq Mərkəzi — " + spec + " (2021–indiyə qədər)\n"
                    + "• 3000+ uşaq müayinəsi, profilaktik baxış və vaksinasiya\n"
                    + "• Uşaq Həkimləri Assosiasiyasının (AAP) üzvü";
            case "Daxili Xəstəliklər" -> "• Respublika Klinik Xəstəxanası — Terapevtik şöbə (2012–2018)\n"
                    + "• MediRegSys — " + spec + " (2018–indiyə qədər)\n"
                    + "• 2000+ ambulator və stasionar müalicə\n"
                    + "• Daxili Tibb Assosiasiyasının (ACP) üzvü";
            default -> "• Müxtəlif klinikalarda 10+ il təcrübə";
        };
    }

    private static String educationFor(String deptName) {
        return switch (deptName) {
            case "Kardiologiya" -> "• Azərbaycan Tibb Universiteti — Müalicə işi (2007–2013)\n"
                    + "• Türkiyə, Marmara Universiteti — Kardiologiya rezidenturası (2013–2017)\n"
                    + "• Almaniya, Charité — İnterventiv kardiologiya təcrübəsi (2018)";
            case "Nevrologiya" -> "• Azərbaycan Tibb Universiteti — Müalicə işi (2006–2012)\n"
                    + "• Türkiyə, Hacettepe Universiteti — Nevrologiya rezidenturası (2012–2016)\n"
                    + "• Avstriya, Vyana Tibb Universiteti — Epilepsiya təcrübəsi (2017)";
            case "Pediatriya" -> "• Azərbaycan Tibb Universiteti — Pediatriya fakültəsi (2008–2014)\n"
                    + "• Türkiyə, İstanbul Universiteti — Pediatriya rezidenturası (2014–2018)\n"
                    + "• İsrail, Schneider Children's Medical Center — təcrübə (2019)";
            case "Daxili Xəstəliklər" -> "• Azərbaycan Tibb Universiteti — Müalicə işi (2005–2011)\n"
                    + "• Türkiyə, Ankara Universiteti — Daxili xəstəliklər rezidenturası (2011–2015)\n"
                    + "• ABŞ, Mayo Clinic — qısamüddətli təcrübə (2016)";
            default -> "• Azərbaycan Tibb Universiteti";
        };
    }

    private static DoctorSeed d(String name, String spec, String bio, String deptName, String avatarUrl) {
        return new DoctorSeed(name, spec, bio, deptName, avatarUrl);
    }

    private record DoctorSeed(String fullName, String specialization, String bio,
                              String deptName, String avatarUrl) { }

    // ========== Demo xəstələr ==========
    private static final String[][] DEMO_PATIENTS = {
            {"demo_aysel",  "Aysel Quliyeva",   "demo.aysel@example.com",  "+994501112201"},
            {"demo_kerim",  "Kərim Hüseynov",   "demo.kerim@example.com",  "+994501112202"},
            {"demo_lale",   "Lalə Əliyeva",     "demo.lale@example.com",   "+994501112203"},
            {"demo_amir",   "Əmir Babayev",     "demo.amir@example.com",   "+994501112204"},
            {"demo_sevda",  "Sevda Məmmədova",  "demo.sevda@example.com",  "+994501112205"},
            {"demo_ramin",  "Ramin Hacıyev",    "demo.ramin@example.com",  "+994501112206"},
            {"demo_aygun",  "Aygün Səfərova",   "demo.aygun@example.com",  "+994501112207"},
            {"demo_emin",   "Emin Quliyev",     "demo.emin@example.com",   "+994501112208"},
            {"demo_nigar",  "Nigar Cəfərova",   "demo.nigar@example.com",  "+994501112209"},
            {"demo_orxan",  "Orxan İbrahimov",  "demo.orxan@example.com",  "+994501112210"},
    };

    private List<User> seedDemoPatients() {
        List<User> patients = new ArrayList<>();
        for (String[] row : DEMO_PATIENTS) {
            String username = row[0];
            Optional<User> existing = userRepository.findByUsername(username);
            if (existing.isPresent()) {
                patients.add(existing.get());
                continue;
            }
            if (userRepository.existsByEmail(row[2])) {
                log.warn("Skipping demo patient {}: email already in use", username);
                continue;
            }
            try {
                User u = User.builder()
                        .username(username)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .fullName(row[1])
                        .email(row[2])
                        .phone(row[3])
                        .role(Role.ROLE_PATIENT)
                        .enabled(true)
                        .build();
                patients.add(userRepository.save(u));
            } catch (Exception ex) {
                log.warn("Could not create demo patient {}: {}", username, ex.getMessage());
            }
        }
        return patients;
    }

    // Hər həkim üçün rating siyahısı (seed sırası ilə)
    // Toplam 20 həkim — hər birinə fərqli sayda və qiymətdə rəylər
    private static final int[][] DOCTOR_RATINGS = {
            // Kardiologiya (5)
            {5, 5, 4, 5, 4, 3},        // Aysel Məmmədova — baş həkim, çox rəy
            {5, 4, 4},                 // Nicat Babayev
            {5, 5, 4, 4, 3},           // Elnur İsmayılov
            {5, 4, 4, 3},              // Tahirə Şirinova
            {5, 4, 3},                 // Vüsal Quliyev
            // Nevrologiya (3)
            {5, 5, 4, 4, 4, 3},        // Rəşid Əliyev
            {5, 4, 4},                 // Səbinə Hacıyeva
            {5, 5},                    // Kamran Mustafayev
            // Pediatriya (8)
            {5, 5, 5, 4, 4, 4, 3, 3},  // Günay Hüseynova — populyar
            {5, 4, 4, 3},              // Murad Quliyev
            {5, 5, 4},                 // Aytac Rzayeva
            {5, 5, 4, 4, 3},           // Famil Əhmədov
            {5, 4},                    // Lalə Səfərova
            {5, 5, 4, 4, 3, 2},        // Orxan Bayramov
            {5, 4, 4},                 // Zərifə Cəfərli
            {5},                       // Tural Kərimov — yeni
            // Daxili Xəstəliklər (4)
            {5, 4, 4, 3},              // Elvin Quliyev
            {5, 5, 4, 4, 3},           // Lalə Cəfərova
            {5, 4},                    // Sənan Əliyev
            {5, 5, 4, 3, 3, 2}         // Nigar Hüseynova
    };

    private static final String[] DEMO_COMMENTS = {
            "Çox peşəkar həkimdir, tövsiyə edirəm.",
            "Səbirli və diqqətlidir, məmnun qaldım.",
            "Vaxtında qəbul etdi, izahlı danışdı.",
            "Mehriban və diqqətli yanaşma.",
            null,
            "Yaxşı diaqnoz qoydu, təşəkkürlər.",
            "Çox razı qaldım, peşəkar yanaşma.",
            null,
            "Normaldır, gözlədiyimdən yaxşı idi.",
            "Mütəxəssis həkimdir, məsləhət görürəm."
    };

    private void seedDemoReviews(List<User> patients) {
        if (patients.isEmpty()) return;

        // Seed sırasını DoctorSeed siyahısı ilə uyğunlaşdırırıq:
        // həkimləri DB-dən yox, seed siyahısındakı adlarla götürürük
        String[] seedOrder = {
                "Dr. Aysel Məmmədova", "Dr. Nicat Babayev", "Dr. Elnur İsmayılov",
                "Dr. Tahirə Şirinova", "Dr. Vüsal Quliyev",
                "Dr. Rəşid Əliyev", "Dr. Səbinə Hacıyeva", "Dr. Kamran Mustafayev",
                "Dr. Günay Hüseynova", "Dr. Murad Quliyev", "Dr. Aytac Rzayeva",
                "Dr. Famil Əhmədov", "Dr. Lalə Səfərova", "Dr. Orxan Bayramov",
                "Dr. Zərifə Cəfərli", "Dr. Tural Kərimov",
                "Dr. Elvin Quliyev", "Dr. Lalə Cəfərova", "Dr. Sənan Əliyev",
                "Dr. Nigar Hüseynova"
        };

        for (int i = 0; i < seedOrder.length && i < DOCTOR_RATINGS.length; i++) {
            Optional<Doctor> opt = doctorRepository.findByFullName(seedOrder[i]);
            if (opt.isEmpty()) continue;
            Doctor doc = opt.get();

            // Yalnız həkimin heç bir rəyi yoxdursa seed et — real rəylərə toxunma
            if (reviewRepository.countByDoctorId(doc.getId()) > 0) continue;

            int[] ratings = DOCTOR_RATINGS[i];
            LocalDateTime base = LocalDateTime.now().minusDays(30);

            for (int j = 0; j < ratings.length && j < patients.size(); j++) {
                User patient = patients.get(j);
                int r = ratings[j];
                QuickFeedback qf = r >= 4 ? QuickFeedback.GOOD
                                  : r == 3 ? QuickFeedback.AVERAGE
                                  : QuickFeedback.BAD;
                String comment = DEMO_COMMENTS[(i * 3 + j) % DEMO_COMMENTS.length];

                Review review = Review.builder()
                        .doctor(doc)
                        .patient(patient)
                        .rating((double) r)
                        .quickFeedback(qf)
                        .comment(comment)
                        .createdAt(base.plusDays(j))
                        .build();
                reviewRepository.save(review);
            }
        }
    }
}
