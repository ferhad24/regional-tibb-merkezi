package az.medical.center.repository;

import az.medical.center.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByDepartmentId(Long departmentId);

    @Query("SELECT d FROM Doctor d JOIN FETCH d.department ORDER BY d.department.name ASC, d.fullName ASC")
    List<Doctor> findAllWithDepartment();

    long countByDepartmentId(Long departmentId);
}
