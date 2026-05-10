package az.medical.center.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartmentForm {

    @NotBlank(message = "Şöbə adı boş ola bilməz")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;
}
