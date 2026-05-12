package az.medical.center.dto;

import az.medical.center.entity.QuickFeedback;
import az.medical.center.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long doctorId;
    private Long patientId;
    private String patientName;
    private Double rating;
    private QuickFeedback quickFeedback;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .doctorId(r.getDoctor().getId())
                .patientId(r.getPatient().getId())
                .patientName(r.getPatient().getFullName())
                .rating(r.getRating())
                .quickFeedback(r.getQuickFeedback())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
