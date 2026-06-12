export type WaitlistReason = 'gender_balance';

export const WAITLIST_REASONS: WaitlistReason[] = ['gender_balance'];

export interface WaitlistState {
  reason: WaitlistReason;
  since: Date;
  position: number;
}
