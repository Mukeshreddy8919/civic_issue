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
  loading = true;
  selectedGrievance: Grievance | null = null;
  
  // Mock officers for now (in real app, fetch from userService)
  officers = ['Officer_Rahul', 'Officer_Priya', 'Officer_Amit', 'Officer_Sneha'];
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
  }

  loadAllGrievances() {
    this.grievanceService.getAll().subscribe({
      next: (data) => {
        this.grievances = data;
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
}
