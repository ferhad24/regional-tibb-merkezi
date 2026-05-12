package az.medical.center.controller;

import az.medical.center.dto.DepartmentResponse;
import az.medical.center.dto.DoctorDetailResponse;
import az.medical.center.dto.DoctorResponse;
import az.medical.center.dto.ReviewResponse;
import az.medical.center.entity.Doctor;
import az.medical.center.entity.User;
import az.medical.center.service.DepartmentService;
import az.medical.center.service.DoctorService;
import az.medical.center.service.ReviewService;
import az.medical.center.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final ReviewService reviewService;
    private final UserService userService;

    @GetMapping("/departments")
    public List<DepartmentResponse> departments() {
        return departmentService.findAll().stream().map(DepartmentResponse::from).toList();
    }

    @GetMapping("/doctors")
    public List<DoctorResponse> doctors(@RequestParam(required = false) Long departmentId) {
        List<Doctor> doctors = (departmentId != null)
                ? doctorService.findByDepartment(departmentId)
                : doctorService.findAll();
        return doctors.stream()
                .map(d -> DoctorResponse.from(
                        d,
                        reviewService.averageRating(d.getId()),
                        reviewService.countByDoctor(d.getId())))
                .toList();
    }

    @GetMapping("/doctors/{id}")
    public DoctorDetailResponse doctor(@PathVariable Long id, Authentication auth) {
        Doctor doctor = doctorService.findById(id);
        Double avg = reviewService.averageRating(id);
        long count = reviewService.countByDoctor(id);

        List<ReviewResponse> reviews = reviewService.findByDoctorId(id).stream()
                .map(ReviewResponse::from).toList();

        ReviewResponse myReview = null;
        if (auth != null && auth.isAuthenticated()
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            try {
                User me = userService.findByUsername(auth.getName());
                myReview = reviewService.findMyReview(id, me.getId())
                        .map(ReviewResponse::from).orElse(null);
            } catch (Exception ignored) {
            }
        }

        return DoctorDetailResponse.builder()
                .doctor(DoctorResponse.from(doctor, avg, count))
                .reviews(reviews)
                .myReview(myReview)
                .build();
    }
}
