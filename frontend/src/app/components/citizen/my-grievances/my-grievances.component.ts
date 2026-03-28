import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../../../services/grievance.service';
import { AuthService } from '../../../services/auth.service';
import { Grievance } from '../../../models/grievance.model';

@Component({
  selector: 'app-my-grievances',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-grievances.component.html',
  styleUrls: ['./my-grievances.component.css']
})
export class MyGrievancesComponent implements OnInit {
  grievances: Grievance[] = [];
  loading = true;
  selectedGrievance: Grievance | null = null;
  rating = 0;
  feedbackText = '';
  submittingFeedback = false;

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService
  ) {}

  logout() {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.loadGrievances();
  }

  loadGrievances() {
    this.grievanceService.getMyGrievances().subscribe({
      next: (data) => {
        this.grievances = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading grievances', err);
        this.loading = false;
      }
    });
  }

  openFeedbackModal(g: Grievance) {
    this.selectedGrievance = g;
    this.rating = 0;
    this.feedbackText = '';
  }

  closeModal() {
    this.selectedGrievance = null;
  }

  setRating(r: number) {
    this.rating = r;
  }

  submitFeedback() {
    if (this.selectedGrievance && this.rating > 0) {
      this.submittingFeedback = true;
      this.grievanceService.submitFeedback(this.selectedGrievance.id, this.rating, this.feedbackText).subscribe({
        next: () => {
          this.loadGrievances(); // Reload to show CLOSED status
          this.closeModal();
          this.submittingFeedback = false;
        },
        error: (err) => {
          console.error('Feedback failed', err);
          this.submittingFeedback = false;
          alert('Failed to submit feedback.');
        }
      });
    }
  }
}
