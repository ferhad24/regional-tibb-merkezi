package az.medical.center.controller;

import az.medical.center.dto.AuthResponse;
import az.medical.center.dto.LoginRequest;
import az.medical.center.dto.RegistrationForm;
import az.medical.center.dto.UserResponse;
import az.medical.center.entity.User;
import az.medical.center.service.JwtService;
import az.medical.center.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegistrationForm form) {
        User user = userService.registerPatient(form);
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        User user = userService.findByUsername(auth.getName());
        String token = jwtService.generateToken(user.getUsername(), user.getRole().name());

        AuthResponse body = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationMs())
                .user(UserResponse.from(user))
                .build();
        return ResponseEntity.ok(body);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        User user = userService.findByUsername(authentication.getName());
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
