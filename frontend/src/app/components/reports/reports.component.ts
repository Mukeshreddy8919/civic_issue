import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { GrievanceService } from '../../services/grievance.service';
import { Grievance } from '../../models/grievance.model';
import { AuthService } from '../../services/auth.service';

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

  // SLA Bar Chart (Average resolution time in days)
  public slaChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { ticks: { color: '#fff' } },
      y: { ticks: { color: '#fff' }, title: { display: true, text: 'Avg Days', color: '#fff' } }
    },
    plugins: {
      legend: { labels: { color: '#fff' } }
    }
  };
  public slaChartData: ChartData<'bar'> = {
    labels: ['Water', 'Electricity', 'Roads', 'Sanitation'],
    datasets: [{ data: [0, 0, 0, 0], label: 'Avg Resolution Days', backgroundColor: '#6366f1' }]
  };

  // Zone Pie Chart (Complaint Zones)
  public zoneChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'] }]
  };

  redZones: { area: string, count: number }[] = [];
  currentUser: any;

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

  constructor(
    private grievanceService: GrievanceService,
    private authService: AuthService
  ) {}

  logout() {
    this.authService.logout();
  }

  ngOnInit(): void {
    const userJson = localStorage.getItem('user');
    this.currentUser = userJson ? JSON.parse(userJson) : null;
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
    // Filter for officers if needed
    let filtered = data;
    if (this.currentUser?.role === 'OFFICER') {
      filtered = data.filter(g => g.assignedOfficer === this.currentUser.username);
    }

    this.totalGrievances = filtered.length;
    
    // Status counts
    const pending = filtered.filter(g => g.status === 'PENDING').length;
    const progress = filtered.filter(g => g.status === 'IN_PROGRESS').length;
    const resolved = filtered.filter(g => g.status === 'RESOLVED').length;
    const closed = filtered.filter(g => g.status === 'CLOSED').length;
    
    this.pieChartData.datasets[0].data = [pending, progress, resolved, closed];
    this.resolvedRate = filtered.length > 0 ? Math.round(((resolved + closed) / filtered.length) * 100) : 0;

    // Category Distribution
    const catMap = new Map<string, number>();
    filtered.forEach(g => {
      catMap.set(g.category, (catMap.get(g.category) || 0) + 1);
    });
    this.barChartData.labels = Array.from(catMap.keys());
    this.barChartData.datasets[0].data = Array.from(catMap.values());

    // SLA Calculation (Avg days per category)
    const slaMap = new Map<string, { total: number, count: number }>();
    filtered.forEach(g => {
      if (g.resolvedAt && g.submittedAt) {
        const start = new Date(g.submittedAt).getTime();
        const end = new Date(g.resolvedAt).getTime();
        const days = (end - start) / (1000 * 60 * 60 * 24);
        const current = slaMap.get(g.category) || { total: 0, count: 0 };
        slaMap.set(g.category, { total: current.total + days, count: current.count + 1 });
      }
    });
    this.slaChartData.labels = Array.from(slaMap.keys());
    this.slaChartData.datasets[0].data = Array.from(slaMap.values()).map(v => Number((v.total / v.count).toFixed(1)));

    // Zone Distribution & Red Zones
    const zoneMap = new Map<string, number>();
    filtered.forEach(g => {
      if (g.location) {
        const zone = g.location.trim();
        zoneMap.set(zone, (zoneMap.get(zone) || 0) + 1);
      }
    });

    this.zoneChartData.labels = Array.from(zoneMap.keys());
    this.zoneChartData.datasets[0].data = Array.from(zoneMap.values());

    // Red Zones (Top 3)
    this.redZones = Array.from(zoneMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => ({ area: entry[0], count: entry[1] }));
  }
}
