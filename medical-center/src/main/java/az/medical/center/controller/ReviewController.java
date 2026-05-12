package az.medical.center.controller;

import az.medical.center.dto.ReviewForm;
import az.medical.center.dto.ReviewResponse;
import az.medical.center.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ReviewResponse submit(@Valid @RequestBody ReviewForm form, Authentication auth) {
        return ReviewResponse.from(reviewService.submit(form, auth.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reviewService.delete(id, auth.getName(), isAdmin);
        return ResponseEntity.noContent().build();
    }
}
