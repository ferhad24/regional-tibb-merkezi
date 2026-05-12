package az.medical.center.dto;

import az.medical.center.entity.QuickFeedback;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewForm {

    @NotNull(message = "Həkim seçilməlidir")
    private Long doctorId;

    @NotNull(message = "Reytinq tələb olunur")
    @DecimalMin(value = "0.5", message = "Minimum 0.5 ulduz")
    @DecimalMax(value = "5.0", message = "Maksimum 5.0 ulduz")
    private Double rating;

    private QuickFeedback quickFeedback;

    @Size(max = 2000, message = "Rəy 2000 simvoldan çox ola bilməz")
    private String comment;
}
