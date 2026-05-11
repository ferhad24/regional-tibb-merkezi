package az.medical.center.repository;

import az.medical.center.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByNameIgnoreCase(String name);

    java.util.Optional<Department> findByNameIgnoreCase(String name);

    @Query("SELECT d FROM Department d ORDER BY " +
           "CASE WHEN d.displayOrder IS NULL THEN 1 ELSE 0 END, " +
           "d.displayOrder ASC, d.name ASC")
    List<Department> findAllByOrderByIdAsc();
}
