import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GrievanceService } from '../../../services/grievance.service';
import { Grievance } from '../../../models/grievance.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-detailed-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detailed-view.component.html',
  styleUrls: ['./detailed-view.component.css']
})
export class DetailedViewComponent implements OnInit {
  grievance: Grievance | null = null;
  loading = true;
  steps = [
    { label: 'Submitted', status: 'PENDING' },
    { label: 'In Progress', status: 'IN_PROGRESS' },
    { label: 'Resolved', status: 'RESOLVED' },
    { label: 'Feedback Provided', status: 'CLOSED' }
  ];

  userRole: string | null = null;
  backRoute: string = '/citizen/my-grievances';

  constructor(
    private route: ActivatedRoute,
    private grievanceService: GrievanceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRole();
    if (this.userRole === 'ADMIN') this.backRoute = '/admin';
    else if (this.userRole === 'OFFICER') this.backRoute = '/officer';
    else this.backRoute = '/citizen/my-grievances';

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadGrievance(id);
    }
  }

  loadGrievance(id: number) {
    this.grievanceService.getAll().subscribe({
      next: (data) => {
        this.grievance = data.find(g => g.id === id) || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading details', err);
        this.loading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  getCurrentStepIndex(): number {
    if (!this.grievance) return -1;
    return this.steps.findIndex(s => s.status === this.grievance?.status);
  }

  isStepCompleted(index: number): boolean {
    return index <= this.getCurrentStepIndex();
  }
}
