package com.civic.smartcity.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class OfficerRecommendationDTO {
    private String username;
    private String department;
    private Double latitude;
    private Double longitude;
    private Double distanceKm;
    private String phone;
    private Long assignedCount;
    private Long resolvedCount;
}
