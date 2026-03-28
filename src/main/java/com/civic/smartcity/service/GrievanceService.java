package com.civic.smartcity.service;

import com.civic.smartcity.dto.AdminAssignRequest;
import com.civic.smartcity.dto.GrievanceRequest;
import com.civic.smartcity.dto.GrievanceResponse;
import com.civic.smartcity.dto.OfficerRecommendationDTO;
import com.civic.smartcity.model.Grievance;
import com.civic.smartcity.model.User;
import com.civic.smartcity.repository.GrievanceRepository;
import com.civic.smartcity.repository.UserRepository;
import com.civic.smartcity.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GrievanceService {

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private static final List<String> VALID_CATEGORIES = List.of(
        "WATER", "STREET_LIGHT", "ROAD", "SANITATION", "DRAINAGE", "PARK", "ELECTRICITY", "OTHER"
    );
    private static final List<String> VALID_PRIORITIES = List.of("LOW", "MEDIUM", "HIGH", "CRITICAL");
    private static final List<String> VALID_STATUSES   = List.of("PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED");

    public GrievanceResponse submit(GrievanceRequest request, String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        String category = request.getCategory() != null ? request.getCategory().toUpperCase() : "OTHER";
        if (!VALID_CATEGORIES.contains(category)) throw new IllegalArgumentException("Invalid category.");

        Grievance g = new Grievance();
        g.setTitle(request.getTitle());
        g.setDescription(request.getDescription());
        g.setCategory(category);
        g.setDepartment(mapCategoryToDepartment(category));
        g.setStatus("PENDING");
        g.setLocation(request.getLocation());
        g.setImageBase64(request.getImageBase64());
        g.setCitizenUsername(username);
        g.setLatitude(request.getLatitude());
        g.setLongitude(request.getLongitude());
        g.setSubmittedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        return toResponse(g);
    }

    private String mapCategoryToDepartment(String category) {
        return switch (category) {
            case "WATER" -> "Water Dept";
            case "STREET_LIGHT", "ELECTRICITY" -> "Electricity board";
            case "ROAD", "PARK" -> "Public Works";
            case "SANITATION", "DRAINAGE" -> "Sanitation";
            default -> "Other";
        };
    }

    public List<GrievanceResponse> getMyGrievances(String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        return grievanceRepository.findByCitizenUsernameOrderBySubmittedAtDesc(username)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GrievanceResponse getById(Long id, String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        String role     = jwtUtil.getRoleFromToken(token);
        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));
        if (role.equals("CITIZEN") && !g.getCitizenUsername().equals(username))
            throw new IllegalArgumentException("Access denied.");
        return toResponse(g);
    }

    public List<GrievanceResponse> getAll() {
        return grievanceRepository.findAllByOrderBySubmittedAtDesc()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<String> getOfficerUsernames(String token) {
        String role = jwtUtil.getRoleFromToken(token);
        if (!"ADMIN".equals(role)) throw new IllegalArgumentException("Only admins can view officers.");
        return userRepository.findByRole("OFFICER")
            .stream().map(User::getUsername).collect(Collectors.toList());
    }

    public List<GrievanceResponse> getByStatus(String status) {
        return grievanceRepository.findByStatusOrderBySubmittedAtDesc(status.toUpperCase())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<GrievanceResponse> getByOfficer(String officer) {
        return grievanceRepository.findByAssignedOfficerOrderBySubmittedAtDesc(officer)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GrievanceResponse adminAssign(AdminAssignRequest request, String token) {
        String role = jwtUtil.getRoleFromToken(token);
        if (!"ADMIN".equals(role)) throw new IllegalArgumentException("Only admins can assign grievances.");

        Grievance g = grievanceRepository.findById(request.getGrievanceId())
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));

        if (request.getAssignedOfficer() != null) g.setAssignedOfficer(request.getAssignedOfficer());
        if (request.getDepartment()      != null) g.setDepartment(request.getDepartment());
        if (request.getPriority()        != null) {
            String p = request.getPriority().toUpperCase();
            if (!VALID_PRIORITIES.contains(p)) throw new IllegalArgumentException("Invalid priority.");
            g.setPriority(p);
        }
        if (request.getDeadline() != null && !request.getDeadline().isBlank()) {
            try {
                // Accept "YYYY-MM-DD" from HTML date input or full ISO datetime
                String raw = request.getDeadline().trim();
                java.time.LocalDateTime dt = raw.contains("T")
                    ? java.time.LocalDateTime.parse(raw)
                    : java.time.LocalDate.parse(raw).atStartOfDay();
                g.setDeadline(dt);
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid deadline format. Use YYYY-MM-DD.");
            }
        }
        if (request.getStatus()   != null) {
            String s = request.getStatus().toUpperCase();
            if (!VALID_STATUSES.contains(s)) throw new IllegalArgumentException("Invalid status.");
            g.setStatus(s);
        }
        if (request.getRemarks()  != null) g.setRemarks(request.getRemarks());

        if (request.getAssignedOfficer() != null && "PENDING".equals(g.getStatus()))
            g.setStatus("IN_PROGRESS");

        g.setUpdatedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        return toResponse(g);
    }

    public GrievanceResponse updateStatus(Long id, String status, String remarks, String token) {
        String role = jwtUtil.getRoleFromToken(token);
        if (!"ADMIN".equals(role) && !"OFFICER".equals(role)) throw new IllegalArgumentException("Unauthorized.");
        String s = status.toUpperCase();
        if (!VALID_STATUSES.contains(s)) throw new IllegalArgumentException("Invalid status.");
        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));
        g.setStatus(s);
        if (remarks != null) g.setRemarks(remarks);
        g.setUpdatedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        return toResponse(g);
    }

    private GrievanceResponse toResponse(Grievance g) {
        return new GrievanceResponse(
            g.getId(), g.getTitle(), g.getDescription(),
            g.getCategory(), g.getStatus(), g.getLocation(),
            g.getImageBase64(), g.getCitizenUsername(),
            g.getSubmittedAt(), g.getUpdatedAt(),
            g.getAssignedOfficer(), g.getRemarks(),
            g.getPriority(), g.getDeadline(), g.getDepartment(),
            g.getResolutionImageBase64(), g.getResolutionDetails(),
            g.getRating(), g.getFeedback(),
            g.getLatitude(), g.getLongitude(),
            g.getResolvedAt()
        );
    }

    public List<OfficerRecommendationDTO> getRecommendedOfficers(Long grievanceId) {
        Grievance g = grievanceRepository.findById(grievanceId)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));
        
        String dept = g.getDepartment();
        if (dept == null) throw new IllegalArgumentException("Grievance has no department assigned.");

        List<User> officers = userRepository.findByRoleAndDepartment("OFFICER", dept);
        
        return officers.stream()
            .map(off -> {
                Double distance = null;
                if (g.getLatitude() != null && g.getLongitude() != null && 
                    off.getLatitude() != null && off.getLongitude() != null) {
                    distance = calculateDistance(g.getLatitude(), g.getLongitude(), off.getLatitude(), off.getLongitude());
                }
                
                long assigned = grievanceRepository.countByAssignedOfficer(off.getUsername());
                long resolved = grievanceRepository.countByAssignedOfficerAndStatus(off.getUsername(), "RESOLVED");
                long closed = grievanceRepository.countByAssignedOfficerAndStatus(off.getUsername(), "CLOSED");

                return new OfficerRecommendationDTO(
                    off.getUsername(), off.getDepartment(), 
                    off.getLatitude(), off.getLongitude(), 
                    distance, off.getPhone(),
                    assigned, (resolved + closed)
                );
            })
            .sorted((o1, o2) -> {
                if (o1.getDistanceKm() == null) return 1;
                if (o2.getDistanceKm() == null) return -1;
                return o1.getDistanceKm().compareTo(o2.getDistanceKm());
            })
            .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public GrievanceResponse resolveGrievance(Long id, String details, String imageBase64, String token) {
        String role     = jwtUtil.getRoleFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        if (!"OFFICER".equals(role)) throw new IllegalArgumentException("Only officers can resolve grievances.");
        
        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));
        
        if (!username.equals(g.getAssignedOfficer()))
            throw new IllegalArgumentException("You are not the assigned officer for this grievance.");

        g.setStatus("RESOLVED");
        g.setResolutionDetails(details);
        g.setResolutionImageBase64(imageBase64);
        g.setUpdatedAt(LocalDateTime.now());
        g.setResolvedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        return toResponse(g);
    }

    public GrievanceResponse submitFeedback(Long id, Integer rating, String feedback, String token) {
        String role     = jwtUtil.getRoleFromToken(token);
        String username = jwtUtil.getUsernameFromToken(token);
        if (!"CITIZEN".equals(role)) throw new IllegalArgumentException("Only citizens can provide feedback.");

        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));
        
        if (!username.equals(g.getCitizenUsername()))
            throw new IllegalArgumentException("You can only provide feedback for your own grievances.");
        
        if (!"RESOLVED".equals(g.getStatus()))
            throw new IllegalArgumentException("Feedback can only be provided for resolved grievances.");

        g.setRating(rating);
        g.setFeedback(feedback);
        g.setStatus("CLOSED"); // Auto-close after feedback
        g.setUpdatedAt(LocalDateTime.now());
        if (g.getResolvedAt() == null) g.setResolvedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        return toResponse(g);
    }
}
