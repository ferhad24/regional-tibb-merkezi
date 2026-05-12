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
    private String experience;
    private String education;
    private String avatarUrl;
    private Long departmentId;
    private String departmentName;
    private Double averageRating;
    private Long reviewCount;

    public static DoctorResponse from(Doctor doctor) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getFullName())
                .specialization(doctor.getSpecialization())
                .bio(doctor.getBio())
                .experience(doctor.getExperience())
                .education(doctor.getEducation())
                .avatarUrl(doctor.getAvatarUrl())
                .departmentId(doctor.getDepartment().getId())
                .departmentName(doctor.getDepartment().getName())
                .averageRating(0.0)
                .reviewCount(0L)
                .build();
    }

    public static DoctorResponse from(Doctor doctor, Double avgRating, Long reviewCount) {
        return DoctorResponse.builder()
                .id(doctor.getId())
                .fullName(doctor.getFullName())
                .specialization(doctor.getSpecialization())
                .bio(doctor.getBio())
                .experience(doctor.getExperience())
                .education(doctor.getEducation())
                .avatarUrl(doctor.getAvatarUrl())
                .departmentId(doctor.getDepartment().getId())
                .departmentName(doctor.getDepartment().getName())
                .averageRating(avgRating == null ? 0.0 : avgRating)
                .reviewCount(reviewCount == null ? 0L : reviewCount)
                .build();
    }
}
