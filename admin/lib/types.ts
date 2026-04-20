export type AdminId = number | string;

export interface AdminRole {
  id: AdminId;
  name?: string;
}

export interface AdminUserSummary {
  id: AdminId;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface AdminUser extends AdminUserSummary {
  phone?: string | null;
  provider: string;
  role?: AdminRole | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminLoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: AdminUser;
}

export interface AdminOtpChallengeResponse {
  requiresOtp: true;
  channel: 'email' | 'phone';
  target: string;
  expiresAt: number;
}

export interface AdminDashboardResponse {
  kpis: {
    totalUsers: number;
    totalMaleUsers: number;
    totalFemaleUsers: number;
    pendingPaymentsCount: number;
    validatedPaymentsCount: number;
    validatedProfiles: number;
    unverifiedIdentities: number;
    totalMatches: number;
    activeMatches: number;
    pendingMatches: number;
  };
  recentRegistrations: Array<{
    date: string;
    count: number;
  }>;
}

export interface AdminProfile {
  id: number;
  userId: number;
  gender: string;
  profession?: string | null;
  country?: string | null;
  city?: string | null;
  isIdentityVerified: boolean;
  isValidated: boolean;
  createdAt: string;
  user?: AdminUserSummary | null;
}

export interface AdminMatch {
  id: number;
  requesterId: number;
  targetId: number;
  status: string;
  createdAt: string;
  requester?: AdminUserSummary | null;
  target?: AdminUserSummary | null;
}

export interface AdminPayment {
  id: number;
  userId: number;
  amount?: number | null;
  type: string;
  status: string;
  createdAt: string;
}
