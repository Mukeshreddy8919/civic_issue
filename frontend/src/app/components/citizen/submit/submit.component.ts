import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GrievanceService } from '../../../services/grievance.service';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.css']
})
export class SubmitComponent {
  submitForm: FormGroup;
  loading = false;
  imagePreview: string | null = null;
  categories = [
    { value: 'WATER', label: 'Water Supply' },
    { value: 'STREET_LIGHT', label: 'Street Lights' },
    { value: 'ROAD', label: 'Road Maintenance' },
    { value: 'SANITATION', label: 'Sanitation' },
    { value: 'DRAINAGE', label: 'Drainage' },
    { value: 'PARK', label: 'Parks & Recreation' },
    { value: 'ELECTRICITY', label: 'Electricity' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private grievanceService: GrievanceService,
    private router: Router
  ) {
    this.submitForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['OTHER', Validators.required],
      location: ['', Validators.required],
      imageBase64: [null]
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.submitForm.patchValue({ imageBase64: this.imagePreview });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.submitForm.valid) {
      this.loading = true;
      this.grievanceService.submit(this.submitForm.value).subscribe({
        next: () => {
          this.router.navigate(['/citizen/my-grievances']);
        },
        error: (err) => {
          console.error('Submission failed', err);
          this.loading = false;
          alert('Failed to submit grievance. Please try again.');
        }
      });
    }
  }
}
