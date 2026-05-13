package az.medical.center.service;

import az.medical.center.dto.PasswordChangeForm;
import az.medical.center.dto.ProfileUpdateForm;
import az.medical.center.dto.RegistrationForm;
import az.medical.center.entity.Role;
import az.medical.center.entity.User;
import az.medical.center.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerPatient(RegistrationForm form) {
        if (userRepository.existsByUsername(form.getUsername())) {
            throw new IllegalArgumentException("Bu istifadəçi adı artıq mövcuddur");
        }
        if (userRepository.existsByEmail(form.getEmail())) {
            throw new IllegalArgumentException("Bu e-poçt artıq qeydiyyatdadır");
        }

        User user = User.builder()
                .username(form.getUsername())
                .password(passwordEncoder.encode(form.getPassword()))
                .fullName(form.getFullName())
                .email(form.getEmail())
                .phone(form.getPhone())
                .role(Role.ROLE_PATIENT)
                .enabled(true)
                .build();

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Cari istifadəçi tapılmadı: " + username));
    }

    @Transactional
    public User updateProfile(String username, ProfileUpdateForm form) {
        User user = findByUsername(username);

        // Email dəyişibsə uniqueness yoxla
        if (!user.getEmail().equalsIgnoreCase(form.getEmail())
                && userRepository.existsByEmail(form.getEmail())) {
            throw new IllegalArgumentException("Bu e-poçt artıq başqa istifadəçi tərəfindən istifadə olunur");
        }

        user.setFullName(form.getFullName());
        user.setEmail(form.getEmail());
        user.setPhone(form.getPhone());
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String username, PasswordChangeForm form) {
        User user = findByUsername(username);
        if (!passwordEncoder.matches(form.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Cari şifrə düzgün deyil");
        }
        user.setPassword(passwordEncoder.encode(form.getNewPassword()));
        userRepository.save(user);
    }
}
