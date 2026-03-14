export interface User {
  username: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICER';
  token?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICER';
}
