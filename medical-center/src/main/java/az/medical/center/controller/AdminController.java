package az.medical.center.controller;

import az.medical.center.dto.*;
import az.medical.center.entity.Role;
import az.medical.center.repository.AppointmentRepository;
import az.medical.center.repository.UserRepository;
import az.medical.center.service.AppointmentService;
import az.medical.center.service.DepartmentService;
import az.medical.center.service.DoctorService;
import az.medical.center.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final AppointmentService appointmentService;
    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        long doctors = doctorService.findAll().size();
        long departments = departmentService.findAll().size();
        long appointments = appointmentService.findAll().size();
        long patients = userRepository.countByRole(Role.ROLE_PATIENT);

        LocalDate from = LocalDate.now().minusDays(6);
        Map<LocalDate, Long> bucket = new HashMap<>();
        for (Object[] row : appointmentRepository.countByDateSince(from)) {
            bucket.put((LocalDate) row[0], ((Number) row[1]).longValue());
        }
        List<Map<String, Object>> series = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = from.plusDays(i);
            Map<String, Object> point = new HashMap<>();
            point.put("date", d.toString());
            point.put("count", bucket.getOrDefault(d, 0L));
            series.add(point);
        }

        List<DoctorResponse> topDoctors = doctorService.findAll().stream()
                .map(d -> DoctorResponse.from(
                        d,
                        reviewService.averageRating(d.getId()),
                        reviewService.countByDoctor(d.getId())))
                .sorted((a, b) -> {
                    int cmp = Double.compare(
                            b.getAverageRating() == null ? 0 : b.getAverageRating(),
                            a.getAverageRating() == null ? 0 : a.getAverageRating());
                    if (cmp != 0) return cmp;
                    return Long.compare(
                            b.getReviewCount() == null ? 0 : b.getReviewCount(),
                            a.getReviewCount() == null ? 0 : a.getReviewCount());
                })
                .limit(5)
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("doctors", doctors);
        result.put("departments", departments);
        result.put("appointments", appointments);
        result.put("patients", patients);
        result.put("appointmentsLast7Days", series);
        result.put("topDoctors", topDoctors);
        return result;
    }

    @GetMapping("/doctors")
    public List<DoctorResponse> doctors() {
        return doctorService.findAll().stream()
                .map(d -> DoctorResponse.from(
                        d,
                        reviewService.averageRating(d.getId()),
                        reviewService.countByDoctor(d.getId())))
                .toList();
    }

    @PostMapping("/doctors")
    public DoctorResponse createDoctor(@Valid @RequestBody DoctorForm form) {
        form.setId(null);
        return DoctorResponse.from(doctorService.save(form));
    }

    @PutMapping("/doctors/{id}")
    public DoctorResponse updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorForm form) {
        form.setId(id);
        return DoctorResponse.from(doctorService.save(form));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        doctorService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/departments")
    public List<DepartmentResponse> departments() {
        return departmentService.findAll().stream().map(DepartmentResponse::from).toList();
    }

    @PostMapping("/departments")
    public DepartmentResponse createDepartment(@Valid @RequestBody DepartmentForm form) {
        return DepartmentResponse.from(departmentService.create(form));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/appointments")
    public List<AppointmentResponse> appointments() {
        return appointmentService.findAll().stream().map(AppointmentResponse::from).toList();
    }

    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
