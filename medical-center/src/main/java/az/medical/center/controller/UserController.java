package az.medical.center.controller;

import az.medical.center.dto.PasswordChangeForm;
import az.medical.center.dto.ProfileUpdateForm;
import az.medical.center.dto.UserResponse;
import az.medical.center.entity.User;
import az.medical.center.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse me(Authentication auth) {
        return UserResponse.from(userService.findByUsername(auth.getName()));
    }

    @PutMapping("/me")
    public UserResponse updateMe(@Valid @RequestBody ProfileUpdateForm form, Authentication auth) {
        User updated = userService.updateProfile(auth.getName(), form);
        return UserResponse.from(updated);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody PasswordChangeForm form,
                                                Authentication auth) {
        userService.changePassword(auth.getName(), form);
        return ResponseEntity.noContent().build();
    }
}
