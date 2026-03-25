import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../../services/grievance.service';
import { AuthService } from '../../services/auth.service';
import { Grievance } from '../../models/grievance.model';

@Component({
  selector: 'app-officer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './officer.component.html',
  styleUrls: ['./officer.component.css']
})
export class OfficerComponent implements OnInit {
  grievances: Grievance[] = [];
  loading = true;
  selectedGrievance: Grievance | null = null;
  resolutionDetails = '';
  resolutionImageBase64: string | null = null;
  submitting = false;

  stats = {
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0
  };

  filteredGrievances: Grievance[] = [];
  filterStatus = 'ALL';

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAssignedGrievances();
  }

  loadAssignedGrievances() {
    this.grievanceService.getAll().subscribe({
      next: (data) => {
        const username = this.authService.currentUser()?.username;
        this.grievances = data.filter(g => g.assignedOfficer === username);
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading officer data', err);
        this.loading = false;
      }
    });
  }

  openResolveModal(g: Grievance) {
    this.selectedGrievance = g;
    this.resolutionDetails = '';
    this.resolutionImageBase64 = null;
  }

  closeModal() {
    this.selectedGrievance = null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.resolutionImageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  updateStatus(g: Grievance, status: string) {
    this.grievanceService.updateStatus(g.id, status, 'Status updated by officer').subscribe({
      next: () => this.loadAssignedGrievances(),
      error: (err) => alert('Failed to update status.')
    });
  }

  submitResolution() {
    if (this.selectedGrievance && this.resolutionDetails) {
      this.submitting = true;
      this.grievanceService.resolve(this.selectedGrievance.id, this.resolutionDetails, this.resolutionImageBase64 || undefined).subscribe({
        next: () => {
          this.loadAssignedGrievances();
          this.closeModal();
          this.submitting = false;
        },
        error: (err) => {
          console.error('Resolution failed', err);
          this.submitting = false;
          alert('Failed to resolve grievance.');
        }
      });
    }
  }

  logout() {
    this.authService.logout();
  }

  calculateStats() {
    this.stats.total = this.grievances.length;
    this.stats.pending = this.grievances.filter(g => g.status === 'PENDING').length;
    this.stats.resolved = this.grievances.filter(g => g.status === 'RESOLVED').length;
    this.stats.inProgress = this.grievances.filter(g => g.status === 'IN_PROGRESS').length;
  }

  applyFilter() {
    if (this.filterStatus === 'ALL') {
      this.filteredGrievances = this.grievances;
    } else {
      this.filteredGrievances = this.grievances.filter(g => g.status === this.filterStatus);
    }
  }

  onFilterChange(status: string) {
    this.filterStatus = status;
    this.applyFilter();
  }
}
