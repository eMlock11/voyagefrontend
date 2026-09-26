export interface UserCredentials {
  email: string;
  password: string;
  [key: string]: any;
}

export interface UserAuthResponse {
  message?: string;
  token?: string;
  user?: any;
}

export interface UserData {
  id?: number | string;
  name?: string;
  email?: string;
  password?: string;
  type?: string;
  phone?: string;
  cpf?: string;
  [key: string]: any;
}

export declare function sanitizeUser(user: any): any;
export declare function clearSession(): void;

export declare const userService: {
  login(credentials: UserCredentials): Promise<UserAuthResponse>;
  register(userData: UserData): Promise<UserAuthResponse>;
  getUserById(id: number | string, token?: string): Promise<any>;
  updateUser(id: number | string, userData: Partial<UserData>, token?: string): Promise<any>;
  getUsers(query?: string, token?: string): Promise<any[]>;
  logout(): void;
  clearSession(): void;
  getToken(): string | null;
  getCurrentUser(): UserData | null;
  updateCurrentUserPlan(planData: any): any;
  isAuthenticated(): boolean;
};
