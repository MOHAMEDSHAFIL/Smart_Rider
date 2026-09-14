import {
  UserProfile,
  EscortProfile,
  PolicySettings,
  AlertItem,
  VehicleMode,
  SessionHistoryItem,
  DistanceMonitoringData,
  SpeedTelemetryData,
  SupervisionIntegrityMatrix
} from '../types';
import {
  MOCK_USERS,
  MOCK_ESCORTS,
  DEFAULT_POLICY,
  INITIAL_ALERTS,
  INITIAL_SESSION_HISTORY,
  INITIAL_SUPERVISION,
  INITIAL_DISTANCE,
  INITIAL_SPEED
} from './mockData';


export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:8000/api';

// Helper to simulate slight async delay in mock mode for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private isOnline = false;

  constructor() {
    this.checkHealth();
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      this.isOnline = res.ok;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public async getSessionState() {
    if (this.isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/session`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('API call failed, using mock fallback', err);
      }
    }
    await delay(60);
    return {
      rider: MOCK_USERS[2],
      escort: MOCK_ESCORTS[0],
      vehicleMode: 'LEARNING' as VehicleMode,
      motorStatus: 'RUNNING' as const,
      speedMode: 'RESTRICTED' as const,
      supervision: INITIAL_SUPERVISION,
      distance: INITIAL_DISTANCE,
      speed: INITIAL_SPEED
    };
  }

  public async getAlerts(): Promise<AlertItem[]> {
    if (this.isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/alerts`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('API call failed, using mock alerts', err);
      }
    }
    await delay(50);
    return INITIAL_ALERTS;
  }

  public async getUsers(): Promise<UserProfile[]> {
    if (this.isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/users`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('API call failed, using mock users', err);
      }
    }
    await delay(50);
    return MOCK_USERS;
  }

  public async getPolicy(): Promise<PolicySettings> {
    if (this.isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/policy`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('API call failed, using mock policy', err);
      }
    }
    await delay(40);
    return DEFAULT_POLICY;
  }

  public async updatePolicy(policy: PolicySettings): Promise<{ success: boolean; policy: PolicySettings }> {
    if (this.isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/policy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(policy)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('API updatePolicy failed, using mock', err);
      }
    }
    await delay(80);
    return { success: true, policy };
  }

  public async getSessionHistory(): Promise<SessionHistoryItem[]> {
    if (this.isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/sessions/history`);
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('API getSessionHistory failed, using mock', err);
      }
    }
    await delay(60);
    return INITIAL_SESSION_HISTORY;
  }
}

export const api = new ApiService();
