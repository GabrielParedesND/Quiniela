export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const DEMO_STORAGE_KEYS = {
  session: 'quiniela_demo_session',
  userId: 'quiniela_demo_user_id',
  profile: 'quiniela_demo_profile',
  predictions: 'quiniela_predictions',
} as const;

export const DEMO_DEFAULT_USER_ID = 'demo-user-001';
