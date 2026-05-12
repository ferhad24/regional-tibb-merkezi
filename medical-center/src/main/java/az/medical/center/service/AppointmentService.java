package az.medical.center.service;

import az.medical.center.dto.AppointmentForm;
import az.medical.center.entity.Appointment;
import az.medical.center.entity.AppointmentStatus;
import az.medical.center.entity.Doctor;
import az.medical.center.entity.User;
import az.medical.center.repository.AppointmentRepository;
import az.medical.center.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final LocalTime SLOT_START = LocalTime.of(9, 0);
    private static final LocalTime SLOT_END = LocalTime.of(17, 0);
    private static final int SLOT_MINUTES = 30;

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<LocalTime> getAvailableSlots(Long doctorId, LocalDate date) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new IllegalArgumentException("Həkim tapılmadı: " + doctorId);
        }
        if (date == null || date.isBefore(LocalDate.now())) {
            return List.of();
        }

        Set<LocalTime> taken = appointmentRepository
                .findByDoctorIdAndDateAndStatus(doctorId, date, AppointmentStatus.BOOKED)
                .stream()
                .map(Appointment::getTime)
                .collect(Collectors.toSet());

        boolean isToday = date.equals(LocalDate.now());
        LocalTime now = LocalTime.now();

        List<LocalTime> slots = new ArrayList<>();
        for (LocalTime t = SLOT_START; t.isBefore(SLOT_END); t = t.plusMinutes(SLOT_MINUTES)) {
            if (taken.contains(t)) continue;
            if (isToday && !t.isAfter(now)) continue;
            slots.add(t);
        }
        return slots;
    }

    @Transactional
    public Appointment book(User patient, AppointmentForm form) {
        if (form.getDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Keçmiş tarixə növbə təyin edilə bilməz");
        }
        if (form.getDate().equals(LocalDate.now()) && !form.getTime().isAfter(LocalTime.now())) {
            throw new IllegalArgumentException("Keçmiş vaxta növbə təyin edilə bilməz");
        }

        List<LocalTime> available = getAvailableSlots(form.getDoctorId(), form.getDate());
        if (!available.contains(form.getTime())) {
            throw new IllegalArgumentException("Seçilən vaxt artıq doludur və ya yararsızdır");
        }

        Doctor doctor = doctorRepository.findById(form.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Həkim tapılmadı: " + form.getDoctorId()));

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .date(form.getDate())
                .time(form.getTime())
                .status(AppointmentStatus.BOOKED)
                .notes(form.getNotes())
                .createdAt(LocalDateTime.now())
                .build();

        try {
            Appointment saved = appointmentRepository.save(appointment);
            // Bütün lazy əlaqələri JOIN FETCH ilə yenidən yüklə ki, controller DTO-ya çevirə bilsin
            return appointmentRepository.findByIdWithDetails(saved.getId()).orElse(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Bu vaxt artıq başqası tərəfindən tutuldu, başqa slot seçin");
        }
    }

    @Transactional(readOnly = true)
    public List<Appointment> findForPatient(Long patientId) {
        return appointmentRepository.findByPatientIdWithDoctor(patientId);
    }

    @Transactional(readOnly = true)
    public List<Appointment> findAll() {
        return appointmentRepository.findAllWithDetails();
    }

    @Transactional
    public void cancelByPatient(Long appointmentId, Long patientId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Növbə tapılmadı"));
        if (!a.getPatient().getId().equals(patientId)) {
            throw new SecurityException("Bu növbə sizə aid deyil");
        }
        if (a.getStatus() != AppointmentStatus.BOOKED) {
            throw new IllegalStateException("Yalnız aktiv növbələr ləğv edilə bilər");
        }
        a.setStatus(AppointmentStatus.CANCELLED);
    }

    @Transactional
    public void cancelByAdmin(Long appointmentId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Növbə tapılmadı"));
        if (a.getStatus() != AppointmentStatus.BOOKED) {
            throw new IllegalStateException("Yalnız aktiv növbələr ləğv edilə bilər");
        }
        a.setStatus(AppointmentStatus.CANCELLED);
    }
}
