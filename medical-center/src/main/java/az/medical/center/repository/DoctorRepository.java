package az.medical.center.repository;

import az.medical.center.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByDepartmentId(Long departmentId);

    @Query("SELECT d FROM Doctor d JOIN FETCH d.department dept ORDER BY " +
           "CASE WHEN dept.displayOrder IS NULL THEN 1 ELSE 0 END, " +
           "dept.displayOrder ASC, dept.name ASC, d.fullName ASC")
    List<Doctor> findAllWithDepartment();

    long countByDepartmentId(Long departmentId);

    java.util.Optional<Doctor> findByFullName(String fullName);

    @Query("SELECT d FROM Doctor d JOIN FETCH d.department WHERE d.id = :id")
    java.util.Optional<Doctor> findByIdWithDepartment(Long id);
}
