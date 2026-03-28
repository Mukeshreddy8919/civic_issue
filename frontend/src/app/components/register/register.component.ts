import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string | null = null;
  loading = false;
  locating = false;
  locationSuccess = false;
  departments = ['Public Works', 'Sanitation', 'Water Dept', 'Electricity board', 'Healthcare'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['CITIZEN', Validators.required],
      phone: [''],
      department: [''],
      latitude: [null],
      longitude: [null]
    });
  }

  detectLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    this.locating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.registerForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.locating = false;
        this.locationSuccess = true;
      },
      (error) => {
        alert('Unable to capture location. Please try again.');
        this.locating = false;
      }
    );
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.error = 'Registration failed. Username might already exist.';
          this.loading = false;
        }
      });
    }
  }
}
