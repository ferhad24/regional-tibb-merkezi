package az.medical.center.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class DoctorDetailResponse {
    private DoctorResponse doctor;
    private List<ReviewResponse> reviews;
    private ReviewResponse myReview; // null olar ki cari istifadəçi rəy verməyibsə
}
