package az.medical.center.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentForm {

    @NotNull(message = "Həkim seçilməlidir")
    private Long doctorId;

    @NotNull(message = "Tarix seçilməlidir")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate date;

    @NotNull(message = "Vaxt seçilməlidir")
    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime time;

    @Size(max = 500)
    private String notes;
}
