export type ActivityType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'SIGNUP_SUCCESS'
  | 'SIGNUP_FAILED'
  | 'PASSWORD_CHANGE_SUCCESS'
  | 'PASSWORD_CHANGE_FAILED'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS';

export interface LogActivityParams {
  userId?: string;
  email: string;
  activityType: ActivityType;
  metadata?: Record<string, any>;
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
