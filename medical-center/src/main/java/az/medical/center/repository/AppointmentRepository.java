package az.medical.center.repository;

import az.medical.center.entity.Appointment;
import az.medical.center.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor d JOIN FETCH d.department " +
            "WHERE a.patient.id = :patientId ORDER BY a.date DESC, a.time DESC")
    List<Appointment> findByPatientIdWithDoctor(Long patientId);

    List<Appointment> findByDoctorIdAndDateAndStatus(Long doctorId, LocalDate date, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a JOIN FETCH a.doctor d JOIN FETCH d.department " +
            "JOIN FETCH a.patient ORDER BY a.date DESC, a.time DESC")
    List<Appointment> findAllWithDetails();

    @Query("SELECT a.date AS d, COUNT(a) AS c FROM Appointment a " +
            "WHERE a.date >= :fromDate GROUP BY a.date ORDER BY a.date ASC")
    List<Object[]> countByDateSince(java.time.LocalDate fromDate);

    long countByPatientId(Long patientId);
}
