import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GrievanceService } from '../../../services/grievance.service';
import { AuthService } from '../../../services/auth.service';
import { Grievance } from '../../../models/grievance.model';

@Component({
  selector: 'app-citizen-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string = '';
  totalGrievances: number = 0;
  pendingGrievances: number = 0;
  resolvedGrievances: number = 0;
  recentGrievances: Grievance[] = [];
  loading: boolean = true;

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.currentUser()?.username || 'Guest';
    this.loadStats();
  }

  loadStats() {
    this.grievanceService.getMyGrievances().subscribe({
      next: (data) => {
        this.recentGrievances = data.slice(0, 5);
        this.totalGrievances = data.length;
        this.pendingGrievances = data.filter(g => g.status === 'PENDING' || g.status === 'IN_PROGRESS').length;
        this.resolvedGrievances = data.filter(g => g.status === 'RESOLVED' || g.status === 'CLOSED').length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading stats', err);
        this.loading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
