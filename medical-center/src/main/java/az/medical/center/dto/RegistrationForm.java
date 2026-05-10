package az.medical.center.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationForm {

    @NotBlank(message = "İstifadəçi adı boş ola bilməz")
    @Size(min = 3, max = 50, message = "İstifadəçi adı 3-50 simvol arası olmalıdır")
    private String username;

    @NotBlank(message = "Şifrə boş ola bilməz")
    @Size(min = 6, max = 100, message = "Şifrə ən azı 6 simvol olmalıdır")
    private String password;

    @NotBlank(message = "Şifrə təkrarı boş ola bilməz")
    private String confirmPassword;

    @NotBlank(message = "Tam ad boş ola bilməz")
    @Size(max = 120)
    private String fullName;

    @NotBlank(message = "E-poçt boş ola bilməz")
    @Email(message = "Düzgün e-poçt ünvanı daxil edin")
    private String email;

    @NotBlank(message = "Telefon nömrəsi boş ola bilməz")
    @Size(max = 30)
    private String phone;

    @AssertTrue(message = "Şifrələr uyğun gəlmir")
    public boolean isPasswordsMatch() {
        return password != null && password.equals(confirmPassword);
    }
}
