import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grievance, GrievanceRequest } from '../models/grievance.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GrievanceService {
  private apiUrl = 'http://localhost:9090/api/grievances';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  submit(request: GrievanceRequest): Observable<Grievance> {
    return this.http.post<Grievance>(`${this.apiUrl}/submit`, request, { headers: this.getHeaders() });
  }

  getMyGrievances(): Observable<Grievance[]> {
    return this.http.get<Grievance[]>(`${this.apiUrl}/my`, { headers: this.getHeaders() });
  }

  getAll(): Observable<Grievance[]> {
    return this.http.get<Grievance[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<Grievance> {
    return this.http.get<Grievance>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  adminAssign(assignData: any): Observable<Grievance> {
    return this.http.post<Grievance>(`${this.apiUrl}/admin/assign`, assignData, { headers: this.getHeaders() });
  }

  updateStatus(id: number, status: string, remarks?: string): Observable<Grievance> {
    return this.http.put<Grievance>(`${this.apiUrl}/${id}/status`, { status, remarks }, { headers: this.getHeaders() });
  }

  resolve(id: number, details: string, resolutionImageBase64?: string): Observable<Grievance> {
    return this.http.post<Grievance>(`${this.apiUrl}/${id}/resolve`, { details, resolutionImageBase64 }, { headers: this.getHeaders() });
  }

  submitFeedback(id: number, rating: number, feedback: string): Observable<Grievance> {
    return this.http.post<Grievance>(`${this.apiUrl}/${id}/feedback`, { rating, feedback }, { headers: this.getHeaders() });
  }
}
