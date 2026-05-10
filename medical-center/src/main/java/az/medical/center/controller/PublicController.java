package az.medical.center.controller;

import az.medical.center.dto.DepartmentResponse;
import az.medical.center.dto.DoctorResponse;
import az.medical.center.service.DepartmentService;
import az.medical.center.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final DoctorService doctorService;
    private final DepartmentService departmentService;

    @GetMapping("/departments")
    public List<DepartmentResponse> departments() {
        return departmentService.findAll().stream().map(DepartmentResponse::from).toList();
    }

    @GetMapping("/doctors")
    public List<DoctorResponse> doctors(@RequestParam(required = false) Long departmentId) {
        if (departmentId != null) {
            return doctorService.findByDepartment(departmentId).stream().map(DoctorResponse::from).toList();
        }
        return doctorService.findAll().stream().map(DoctorResponse::from).toList();
    }

    @GetMapping("/doctors/{id}")
    public DoctorResponse doctor(@org.springframework.web.bind.annotation.PathVariable Long id) {
        return DoctorResponse.from(doctorService.findById(id));
    }
}
