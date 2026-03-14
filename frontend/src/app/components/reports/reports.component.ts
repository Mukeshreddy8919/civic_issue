import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { GrievanceService } from '../../services/grievance.service';
import { Grievance } from '../../models/grievance.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  loading = true;
  totalGrievances = 0;
  resolvedRate = 0;

  // Pie Chart (Status Distribution)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#fff' } }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Pending', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#fdbb2d', '#22c1c3', '#00ff00', '#777']
    }]
  };
  public pieChartType: ChartType = 'pie';

  // Bar Chart (Category Distribution)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { ticks: { color: '#fff' } }
    },
    plugins: {
      legend: { labels: { color: '#fff' } }
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Grievances per Category', backgroundColor: '#fdbb2d' }
    ]
  };
  public barChartType: ChartType = 'bar';

  constructor(private grievanceService: GrievanceService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.grievanceService.getAll().subscribe({
      next: (data) => {
        this.processStats(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reports', err);
        this.loading = false;
      }
    });
  }

  processStats(data: Grievance[]) {
    this.totalGrievances = data.length;
    
    // Status counts
    const pending = data.filter(g => g.status === 'PENDING').length;
    const progress = data.filter(g => g.status === 'IN_PROGRESS').length;
    const resolved = data.filter(g => g.status === 'RESOLVED').length;
    const closed = data.filter(g => g.status === 'CLOSED').length;
    
    this.pieChartData.datasets[0].data = [pending, progress, resolved, closed];
    this.resolvedRate = data.length > 0 ? Math.round(((resolved + closed) / data.length) * 100) : 0;

    // Category counts
    const catMap = new Map<string, number>();
    data.forEach(g => {
      catMap.set(g.category, (catMap.get(g.category) || 0) + 1);
    });

    this.barChartData.labels = Array.from(catMap.keys());
    this.barChartData.datasets[0].data = Array.from(catMap.values());
  }
}
