package az.medical.center.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateForm {

    @NotBlank(message = "Tam ad boş ola bilməz")
    @Size(min = 3, max = 120, message = "Tam ad 3 - 120 simvol olmalıdır")
    private String fullName;

    @NotBlank(message = "E-poçt boş ola bilməz")
    @Email(message = "Düzgün e-poçt daxil edin")
    @Size(max = 120)
    private String email;

    @NotBlank(message = "Telefon boş ola bilməz")
    @Pattern(regexp = "^\\+994\\d{9}$", message = "+994 sonra 9 rəqəm olmalıdır")
    private String phone;
}
