package com.civic.smartcity;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HomeController {

    @GetMapping("/")
    @ResponseBody
    public ResponseEntity<Void> home() {
        return ResponseEntity.status(302)
            .header("Location", "/index.html")
            .build();
    }

    @GetMapping("/dashboard")
    @ResponseBody
    public ResponseEntity<Void> dashboard() {
        return ResponseEntity.status(302)
            .header("Location", "/dashboard.html")
            .build();
    }

    @GetMapping("/submit")
    @ResponseBody
    public ResponseEntity<Void> submit() {
        return ResponseEntity.status(302)
            .header("Location", "/submit.html")
            .build();
    }

    @GetMapping("/mygrievances")
    @ResponseBody
    public ResponseEntity<Void> mygrievances() {
        return ResponseEntity.status(302)
            .header("Location", "/mygrievances.html")
            .build();
    }

    @GetMapping("/favicon.ico")
    @ResponseBody
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }
}
