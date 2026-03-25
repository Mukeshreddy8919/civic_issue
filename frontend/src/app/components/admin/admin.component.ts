import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GrievanceService } from '../../services/grievance.service';
import { AuthService } from '../../services/auth.service';
import { Grievance } from '../../models/grievance.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  grievances: Grievance[] = [];
  filteredGrievances: Grievance[] = [];
  loading = true;
  selectedGrievance: Grievance | null = null;
  
  stats = {
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0
  };

  filterStatus = 'ALL';
  
  // Officers loaded from backend
  officers: string[] = [];
  departments = ['Public Works', 'Sanitation', 'Water Dept', 'Electricity board', 'Healthcare'];
  
  assignData = {
    assignedOfficer: '',
    department: '',
    priority: 'MEDIUM',
    deadline: '',
    remarks: ''
  };

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllGrievances();
    this.loadOfficers();
  }

  loadOfficers() {
    this.grievanceService.getOfficers().subscribe({
      next: (data) => {
        this.officers = data;
      },
      error: (err) => {
        console.warn('Could not load officers:', err);
      }
    });
  }

  loadAllGrievances() {
    this.grievanceService.getAll().subscribe({
      next: (data) => {
        this.grievances = data;
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading admin data', err);
        this.loading = false;
      }
    });
  }

  openAssignModal(g: Grievance) {
    this.selectedGrievance = g;
    this.assignData = {
      assignedOfficer: g.assignedOfficer || '',
      department: g.department || '',
      priority: g.priority || 'MEDIUM',
      deadline: g.deadline ? g.deadline.split('T')[0] : '',
      remarks: g.remarks || ''
    };
  }

  closeModal() {
    this.selectedGrievance = null;
  }

  submitAssignment() {
    if (this.selectedGrievance) {
      const payload = {
        grievanceId: this.selectedGrievance.id,
        ...this.assignData
      };
      
      this.grievanceService.adminAssign(payload).subscribe({
        next: () => {
          this.loadAllGrievances();
          this.closeModal();
        },
        error: (err) => {
          console.error('Assignment failed', err);
          alert('Failed to assign grievance.');
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
