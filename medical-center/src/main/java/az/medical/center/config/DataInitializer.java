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

    private static String img(String id) {
        return "https://images.unsplash.com/photo-" + id
                + "?w=400&h=400&fit=crop&crop=faces&q=80&auto=format";
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
                        "Kardiologiya", img("1559839734-2b71ea197ec2")),
                d("Dr. Nicat Babayev", "Kardioloq",
                        "Ürək ritmi pozğunluqları, qan təzyiqi və əməliyyatdan sonrakı reabilitasiya.",
                        "Kardiologiya", img("1612349317150-e413f6a5b16d")),
                d("Dr. Elnur İsmayılov", "İnvaziv kardioloq",
                        "Angiografiya, stent qoyulması və koroner damar müdaxilələri.",
                        "Kardiologiya", img("1622253692010-333f2da6031d")),
                d("Dr. Tahirə Şirinova", "Kardioloq-aritmoloq",
                        "Aritmiya, sinkop və holter monitorinqi sahəsində ixtisaslaşıb.",
                        "Kardiologiya", img("1594824476967-48c8b964273f")),
                d("Dr. Vüsal Quliyev", "Kardioloq, profilaktika",
                        "Profilaktik müayinələr, xolesterin və qan təzyiqi izləməsi.",
                        "Kardiologiya", img("1537368910025-700350fe46c7")),

                // Nevrologiya (3)
                d("Dr. Rəşid Əliyev", "Nevroloq",
                        "Baş ağrıları, miqren və yuxu pozğunluqları üzrə ixtisaslaşıb.",
                        "Nevrologiya", img("1666214280557-f1b5022eb634")),
                d("Dr. Səbinə Hacıyeva", "Nevroloq, EEG mütəxəssisi",
                        "Epilepsiya, neyropatiya və insult sonrası reabilitasiya.",
                        "Nevrologiya", img("1551601651-2a8555f1a136")),
                d("Dr. Kamran Mustafayev", "Nevroloq, baş ağrıları mərkəzi rəhbəri",
                        "Xroniki migren, cluster baş ağrıları və botoks terapiyası.",
                        "Nevrologiya", img("1559757175-5700dde675bc")),

                // Pediatriya (8)
                d("Dr. Günay Hüseynova", "Pediatr",
                        "Yenidoğulmuşdan yeniyetmə yaşa qədər uşaq sağlamlığı.",
                        "Pediatriya", img("1582750433449-648ed127bb54")),
                d("Dr. Murad Quliyev", "Pediatr, allerqoloq",
                        "Uşaq allergiyaları, immun sistem və vaksinasiya məsləhəti.",
                        "Pediatriya", img("1631217872822-1c2546d6b864")),
                d("Dr. Aytac Rzayeva", "Yenidoğulmuş pediatr",
                        "Yenidoğulmuş bakımı, prematür uşaqlar və erkən inkişaf.",
                        "Pediatriya", img("1638202993928-7267aad84c31")),
                d("Dr. Famil Əhmədov", "Pediatr-kardioloq",
                        "Uşaqlarda anadangəlmə ürək qüsurları və exo-kardioqrafiya.",
                        "Pediatriya", img("1551884170-09fb70a3a2ed")),
                d("Dr. Lalə Səfərova", "Pediatr, infeksionist",
                        "Uşaq infeksion xəstəlikləri, hepatit və ümumi viral xəstəliklər.",
                        "Pediatriya", img("1607746882042-944635dfe10e")),
                d("Dr. Orxan Bayramov", "Pediatr-nevroloq",
                        "Uşaq epilepsiyası, beyin inkişafı və hərəkət pozğunluqları.",
                        "Pediatriya", img("1606206522398-de6e2bcd2d09")),
                d("Dr. Zərifə Cəfərli", "Pediatr-endokrinoloq",
                        "Uşaq diabeti, böyümə hormonu və tiroid xəstəlikləri.",
                        "Pediatriya", img("1530497610245-94d3c16cda28")),
                d("Dr. Tural Kərimov", "Pediatr",
                        "Ümumi pediatrik müayinə, profilaktik baxış və inkişaf izləməsi.",
                        "Pediatriya", img("1576091160399-112ba8d25d1d")),

                // Daxili Xəstəliklər (4)
                d("Dr. Elvin Quliyev", "Daxili Xəstəliklər mütəxəssisi",
                        "Hipertenziya, diabet və mədə-bağırsaq xəstəlikləri.",
                        "Daxili Xəstəliklər", img("1602233158242-3ba0ac4d2167")),
                d("Dr. Lalə Cəfərova", "Endokrinoloq",
                        "Tiroid, diabet və hormonal balans pozğunluqları.",
                        "Daxili Xəstəliklər", img("1614608682850-e0d6ed316d47")),
                d("Dr. Sənan Əliyev", "Qastroenteroloq",
                        "Mədə xorası, qastrit, qaraciyər xəstəlikləri və endoskopiya.",
                        "Daxili Xəstəliklər", img("1612349317150-e413f6a5b16d")),
                d("Dr. Nigar Hüseynova", "Pulmonoloq",
                        "Astma, bronxit və tənəffüs yolu xəstəlikləri.",
                        "Daxili Xəstəliklər", img("1612531386530-97286d97c2d2"))
        );

        for (DoctorSeed s : seeds) {
            Optional<Doctor> existing = doctorRepository.findByFullName(s.fullName);
            if (existing.isPresent()) {
                Doctor d = existing.get();
                d.setSpecialization(s.specialization);
                d.setBio(s.bio);
                d.setAvatarUrl(s.avatarUrl);
                d.setDepartment(depts.get(s.deptName));
            } else {
                doctorRepository.save(Doctor.builder()
                        .fullName(s.fullName)
                        .specialization(s.specialization)
                        .bio(s.bio)
                        .avatarUrl(s.avatarUrl)
                        .department(depts.get(s.deptName))
                        .build());
            }
        }
    }

    private static DoctorSeed d(String name, String spec, String bio, String deptName, String avatarUrl) {
        return new DoctorSeed(name, spec, bio, deptName, avatarUrl);
    }

    private record DoctorSeed(String fullName, String specialization, String bio,
                              String deptName, String avatarUrl) { }
}
