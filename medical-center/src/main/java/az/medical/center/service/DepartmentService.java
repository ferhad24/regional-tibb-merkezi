package az.medical.center.service;

import az.medical.center.dto.DepartmentForm;
import az.medical.center.entity.Department;
import az.medical.center.repository.DepartmentRepository;
import az.medical.center.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<Department> findAll() {
        return departmentRepository.findAllByOrderByIdAsc();
    }

    @Transactional(readOnly = true)
    public Department findById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Şöbə tapılmadı: " + id));
    }

    @Transactional
    public Department create(DepartmentForm form) {
        if (departmentRepository.existsByNameIgnoreCase(form.getName())) {
            throw new IllegalArgumentException("Bu adda şöbə artıq mövcuddur");
        }
        Department dept = Department.builder()
                .name(form.getName())
                .description(form.getDescription())
                .build();
        return departmentRepository.save(dept);
    }

    @Transactional
    public void delete(Long id) {
        long doctorCount = doctorRepository.countByDepartmentId(id);
        if (doctorCount > 0) {
            throw new IllegalStateException("Şöbədə həkimlər var, əvvəlcə həkimləri silin");
        }
        departmentRepository.deleteById(id);
    }
}
