package az.medical.center.repository;

import az.medical.center.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r JOIN FETCH r.patient WHERE r.doctor.id = :doctorId ORDER BY r.createdAt DESC")
    List<Review> findByDoctorId(Long doctorId);

    Optional<Review> findByDoctorIdAndPatientId(Long doctorId, Long patientId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.doctor.id = :doctorId")
    Double averageRatingForDoctor(Long doctorId);

    long countByDoctorId(Long doctorId);
}
