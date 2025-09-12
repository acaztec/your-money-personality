export interface Advisor {
  id: string;
  email: string;
  name: string;
  company?: string;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  company?: string;
}

export class AuthService {
  private static readonly STORAGE_KEY = 'advisor_auth';
  private static readonly ADVISORS_KEY = 'advisors_db';

  static generateAdvisorId(): string {
    return 'advisor_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  static async login(credentials: LoginCredentials): Promise<{ success: boolean; advisor?: Advisor; error?: string }> {
    try {
      const advisors = this.getAllAdvisors();
      const advisor = advisors.find(a => a.email === credentials.email);

      if (!advisor) {
        return { success: false, error: 'Invalid email or password' };
      }

      // In a real app, you'd verify the password hash
      // For this demo, we'll just check if password is not empty
      if (!credentials.password || credentials.password.length < 6) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Store auth session
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        advisorId: advisor.id,
        email: advisor.email,
        loginTime: Date.now()
      }));

      return { success: true, advisor };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  static async signup(data: SignupData): Promise<{ success: boolean; advisor?: Advisor; error?: string }> {
    try {
      const advisors = this.getAllAdvisors();
      
      // Check if email already exists
      if (advisors.find(a => a.email === data.email)) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Create new advisor
      const newAdvisor: Advisor = {
        id: this.generateAdvisorId(),
        email: data.email,
        name: data.name,
        company: data.company,
        createdAt: new Date()
      };

      // Save advisor
      advisors.push(newAdvisor);
      localStorage.setItem(this.ADVISORS_KEY, JSON.stringify(advisors));

      // Store auth session
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        advisorId: newAdvisor.id,
        email: newAdvisor.email,
        loginTime: Date.now()
      }));

      return { success: true, advisor: newAdvisor };
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getCurrentAdvisor(): Advisor | null {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (!authData) return null;

      const { advisorId } = JSON.parse(authData);
      const advisors = this.getAllAdvisors();
      return advisors.find(a => a.id === advisorId) || null;
    } catch (error) {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    try {
      const authData = localStorage.getItem(this.STORAGE_KEY);
      if (!authData) return false;

      const { loginTime } = JSON.parse(authData);
      const dayInMs = 24 * 60 * 60 * 1000;
      
      // Session expires after 24 hours
      return Date.now() - loginTime < dayInMs;
    } catch (error) {
      return false;
    }
  }

  private static getAllAdvisors(): Advisor[] {
    try {
      const stored = localStorage.getItem(this.ADVISORS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  static getAdvisorById(advisorId: string): Advisor | null {
    const advisors = this.getAllAdvisors();
    return advisors.find(a => a.id === advisorId) || null;
  }
}