package az.medical.center.service;

import az.medical.center.dto.DoctorForm;
import az.medical.center.entity.Department;
import az.medical.center.entity.Doctor;
import az.medical.center.repository.DepartmentRepository;
import az.medical.center.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public List<Doctor> findAll() {
        return doctorRepository.findAllWithDepartment();
    }

    @Transactional(readOnly = true)
    public Doctor findById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Həkim tapılmadı: " + id));
    }

    @Transactional(readOnly = true)
    public List<Doctor> findByDepartment(Long departmentId) {
        return doctorRepository.findByDepartmentId(departmentId);
    }

    @Transactional
    public Doctor save(DoctorForm form) {
        Department department = departmentRepository.findById(form.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Şöbə tapılmadı: " + form.getDepartmentId()));

        Doctor doctor;
        if (form.getId() != null) {
            doctor = doctorRepository.findById(form.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Həkim tapılmadı: " + form.getId()));
        } else {
            doctor = new Doctor();
        }

        doctor.setFullName(form.getFullName());
        doctor.setSpecialization(form.getSpecialization());
        doctor.setBio(form.getBio());
        doctor.setExperience(form.getExperience());
        doctor.setEducation(form.getEducation());
        doctor.setAvatarUrl(form.getAvatarUrl());
        doctor.setDepartment(department);

        return doctorRepository.save(doctor);
    }

    @Transactional
    public void delete(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new IllegalArgumentException("Həkim tapılmadı: " + id);
        }
        doctorRepository.deleteById(id);
    }
}
