package az.medical.center.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorForm {

    private Long id;

    @NotBlank(message = "Tam ad boş ola bilməz")
    @Size(max = 120)
    private String fullName;

    @NotBlank(message = "İxtisas boş ola bilməz")
    @Size(max = 120)
    private String specialization;

    @Size(max = 2000)
    private String bio;

    @Size(max = 4000)
    private String experience;

    @Size(max = 4000)
    private String education;

    @Size(max = 500)
    private String avatarUrl;

    @NotNull(message = "Şöbə seçilməlidir")
    private Long departmentId;
}
