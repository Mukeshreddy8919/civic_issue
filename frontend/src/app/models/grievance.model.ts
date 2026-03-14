export interface Grievance {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  imageBase64?: string;
  citizenUsername: string;
  submittedAt: string;
  updatedAt?: string;
  assignedOfficer?: string;
  remarks?: string;
  priority?: string;
  deadline?: string;
  department?: string;
  resolutionImageBase64?: string;
  resolutionDetails?: string;
  rating?: number;
  feedback?: string;
}

export interface GrievanceRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  imageBase64?: string;
}
