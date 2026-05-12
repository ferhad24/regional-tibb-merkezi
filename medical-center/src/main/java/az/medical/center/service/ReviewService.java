package az.medical.center.service;

import az.medical.center.dto.ReviewForm;
import az.medical.center.entity.Doctor;
import az.medical.center.entity.Review;
import az.medical.center.entity.User;
import az.medical.center.repository.DoctorRepository;
import az.medical.center.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final DoctorRepository doctorRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<Review> findByDoctorId(Long doctorId) {
        return reviewRepository.findByDoctorId(doctorId);
    }

    @Transactional(readOnly = true)
    public Double averageRating(Long doctorId) {
        Double avg = reviewRepository.averageRatingForDoctor(doctorId);
        return avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0;
    }

    @Transactional(readOnly = true)
    public long countByDoctor(Long doctorId) {
        return reviewRepository.countByDoctorId(doctorId);
    }

    @Transactional(readOnly = true)
    public Optional<Review> findMyReview(Long doctorId, Long patientId) {
        return reviewRepository.findByDoctorIdAndPatientId(doctorId, patientId);
    }

    @Transactional
    public Review submit(ReviewForm form, String username) {
        Double rating = form.getRating();
        rating = Math.round(rating * 2.0) / 2.0;
        if (rating < 0.5 || rating > 5.0) {
            throw new IllegalArgumentException("Reytinq 0.5 - 5.0 aralığında olmalıdır");
        }

        Doctor doctor = doctorRepository.findById(form.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Həkim tapılmadı: " + form.getDoctorId()));

        User patient = userService.findByUsername(username);

        Optional<Review> existing = reviewRepository.findByDoctorIdAndPatientId(doctor.getId(), patient.getId());
        Review review;
        if (existing.isPresent()) {
            review = existing.get();
            review.setRating(rating);
            review.setQuickFeedback(form.getQuickFeedback());
            review.setComment(form.getComment());
            review.setUpdatedAt(LocalDateTime.now());
        } else {
            review = Review.builder()
                    .doctor(doctor)
                    .patient(patient)
                    .rating(rating)
                    .quickFeedback(form.getQuickFeedback())
                    .comment(form.getComment())
                    .createdAt(LocalDateTime.now())
                    .build();
        }
        return reviewRepository.save(review);
    }

    @Transactional
    public void delete(Long reviewId, String username, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Rəy tapılmadı: " + reviewId));
        if (!isAdmin) {
            User user = userService.findByUsername(username);
            if (!review.getPatient().getId().equals(user.getId())) {
                throw new IllegalStateException("Bu rəyi silmək hüququnuz yoxdur");
            }
        }
        reviewRepository.delete(review);
    }
}
