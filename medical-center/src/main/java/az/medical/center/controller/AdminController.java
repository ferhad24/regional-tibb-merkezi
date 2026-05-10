package az.medical.center.controller;

import az.medical.center.dto.*;
import az.medical.center.service.AppointmentService;
import az.medical.center.service.DepartmentService;
import az.medical.center.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        long doctors = doctorService.findAll().size();
        long departments = departmentService.findAll().size();
        long appointments = appointmentService.findAll().size();
        return Map.of(
                "doctors", doctors,
                "departments", departments,
                "appointments", appointments
        );
    }

    @GetMapping("/doctors")
    public List<DoctorResponse> doctors() {
        return doctorService.findAll().stream().map(DoctorResponse::from).toList();
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
