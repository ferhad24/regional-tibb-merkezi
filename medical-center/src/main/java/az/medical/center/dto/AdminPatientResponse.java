package az.medical.center.dto;

import az.medical.center.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminPatientResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private boolean enabled;
    private long appointmentCount;

    public static AdminPatientResponse from(User u, long appointmentCount) {
        return AdminPatientResponse.builder()
                .id(u.getId())
                .username(u.getUsername())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .enabled(u.isEnabled())
                .appointmentCount(appointmentCount)
                .build();
    }
}
