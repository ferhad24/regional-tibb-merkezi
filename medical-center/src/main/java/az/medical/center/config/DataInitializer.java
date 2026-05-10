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

import java.util.List;
import java.util.Map;

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

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedDepartmentsAndDoctors();
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

    private void seedDepartmentsAndDoctors() {
        if (departmentRepository.count() > 0) return;

        Map<String, String> deptDescriptions = Map.of(
                "Kardiologiya", "Ürək və damar xəstəlikləri şöbəsi",
                "Nevrologiya", "Sinir sistemi xəstəlikləri şöbəsi",
                "Pediatriya", "Uşaq xəstəlikləri şöbəsi",
                "Daxili Xəstəliklər", "Daxili orqanların xəstəlikləri şöbəsi"
        );

        Department kardio = saveDept("Kardiologiya", deptDescriptions.get("Kardiologiya"));
        Department nevro = saveDept("Nevrologiya", deptDescriptions.get("Nevrologiya"));
        Department pedia = saveDept("Pediatriya", deptDescriptions.get("Pediatriya"));
        Department daxili = saveDept("Daxili Xəstəliklər", deptDescriptions.get("Daxili Xəstəliklər"));

        List<Doctor> doctors = List.of(
                doctor("Dr. Aysel Məmmədova", "Kardioloq, baş həkim",
                        "10+ il təcrübəli kardioloq, EKQ və exo-kardioqrafiya üzrə mütəxəssis.", kardio),
                doctor("Dr. Rəşid Əliyev", "Nevroloq",
                        "Baş ağrıları, miqren və yuxu pozğunluqları üzrə ixtisaslaşıb.", nevro),
                doctor("Dr. Günay Hüseynova", "Pediatr",
                        "Yenidoğulmuşdan yeniyetmə yaşa qədər uşaq sağlamlığı.", pedia),
                doctor("Dr. Elvin Quliyev", "Daxili Xəstəliklər mütəxəssisi",
                        "Hipertenziya, diabet və mədə-bağırsaq xəstəlikləri.", daxili)
        );
        doctorRepository.saveAll(doctors);
    }

    private Department saveDept(String name, String desc) {
        return departmentRepository.save(Department.builder().name(name).description(desc).build());
    }

    private Doctor doctor(String name, String spec, String bio, Department dept) {
        return Doctor.builder()
                .fullName(name)
                .specialization(spec)
                .bio(bio)
                .department(dept)
                .build();
    }
}
