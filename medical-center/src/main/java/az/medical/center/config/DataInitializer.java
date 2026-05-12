package az.medical.center.config;

import az.medical.center.entity.Department;
import az.medical.center.entity.Doctor;
import az.medical.center.entity.Role;
import az.medical.center.entity.User;
import az.medical.center.repository.DepartmentRepository;
import az.medical.center.repository.DoctorRepository;
import az.medical.center.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

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
    @Transactional
    public void run(String... args) {
        seedAdmin();
        Map<String, Department> depts = ensureDepartments();
        seedDoctors(depts);
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
}
