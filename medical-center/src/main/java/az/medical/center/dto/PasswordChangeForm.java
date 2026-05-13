package az.medical.center.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordChangeForm {

    @NotBlank(message = "Cari şifrə tələb olunur")
    private String currentPassword;

    @NotBlank(message = "Yeni şifrə boş ola bilməz")
    @Size(min = 6, max = 100, message = "Yeni şifrə ən azı 6 simvol olmalıdır")
    private String newPassword;
}
