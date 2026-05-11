package az.medical.center.dto;

import az.medical.center.entity.Doctor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DoctorResponse {
    private Long id;
    private String fullName;
    private String specialization;
    private String bio;
    private String avatarUrl;
    private Long departmentId;
    private String departmentName;

    public static DoctorResponse from(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getFullName())
                .specialization(doctor.getSpecialization())
                .bio(doctor.getBio())
                .avatarUrl(doctor.getAvatarUrl())
                .departmentId(doctor.getDepartment().getId())
                .departmentName(doctor.getDepartment().getName())
                .build();
    }
}
