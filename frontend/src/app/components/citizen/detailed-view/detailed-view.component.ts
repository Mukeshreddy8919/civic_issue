import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GrievanceService } from '../../../services/grievance.service';
import { Grievance } from '../../../models/grievance.model';

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

  constructor(
    private route: ActivatedRoute,
    private grievanceService: GrievanceService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadGrievance(id);
    }
  }

  loadGrievance(id: number) {
    // We can reuse getMyGrievances or getAll for now, or just get by id if implemented
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

  getCurrentStepIndex(): number {
    if (!this.grievance) return -1;
    return this.steps.findIndex(s => s.status === this.grievance?.status);
  }

  isStepCompleted(index: number): boolean {
    return index <= this.getCurrentStepIndex();
  }
}
