package az.medical.center.dto;

import az.medical.center.entity.Appointment;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String departmentName;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime time;

    private String status;
    private String notes;
    private LocalDateTime createdAt;

    public static AppointmentResponse from(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getFullName())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getFullName())
                .departmentName(a.getDoctor().getDepartment().getName())
                .date(a.getDate())
                .time(a.getTime())
                .status(a.getStatus().name())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
