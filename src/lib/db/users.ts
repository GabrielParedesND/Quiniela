export interface UserProfile {
  userId: string;
  createdAt: string;
  email: string;
  nombres: string;
  apellidos: string;
  dpi: string;
  tel: string;
  edad: string;
}

export class SessionExpiredError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'SessionExpiredError';
  }
}

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const error = await response.json();
    if (error.error?.includes('expired') || error.error?.includes('ExpiredToken')) {
      throw new SessionExpiredError();
    }
    throw new Error(error.error || 'Error al guardar perfil');
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const response = await fetch(`/api/profile?userId=${userId}`);

  if (!response.ok) {
    const error = await response.json();
    if (error.error?.includes('expired') || error.error?.includes('ExpiredToken')) {
      throw new SessionExpiredError();
    }
    throw new Error(error.error || 'Error al obtener perfil');
  }

  const data = await response.json();
  return data.profile;
};
