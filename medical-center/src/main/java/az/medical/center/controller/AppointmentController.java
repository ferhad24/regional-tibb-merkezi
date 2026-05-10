package az.medical.center.controller;

import az.medical.center.dto.AppointmentForm;
import az.medical.center.dto.AppointmentResponse;
import az.medical.center.entity.Appointment;
import az.medical.center.entity.User;
import az.medical.center.service.AppointmentService;
import az.medical.center.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserService userService;

    @GetMapping("/available-slots")
    public List<String> availableSlots(@RequestParam Long doctorId,
                                       @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return appointmentService.getAvailableSlots(doctorId, date)
                .stream()
                .map(t -> t.toString().substring(0, 5))
                .toList();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public List<AppointmentResponse> myAppointments(Authentication authentication) {
        User me = userService.findByUsername(authentication.getName());
        return appointmentService.findForPatient(me.getId())
                .stream()
                .map(AppointmentResponse::from)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<AppointmentResponse> book(@Valid @RequestBody AppointmentForm form,
                                                    Authentication authentication) {
        User me = userService.findByUsername(authentication.getName());
        Appointment a = appointmentService.book(me, form);
        return ResponseEntity.ok(AppointmentResponse.from(a));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
        User me = userService.findByUsername(authentication.getName());
        appointmentService.cancelByPatient(id, me.getId());
        return ResponseEntity.noContent().build();
    }
}
