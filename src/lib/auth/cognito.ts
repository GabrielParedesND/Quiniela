import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { logActivity } from '@/lib/logger/activity';
import { DEMO_DEFAULT_USER_ID, DEMO_STORAGE_KEYS, IS_DEMO_MODE } from '@/lib/demo-mode';

let userPool: CognitoUserPool | null = null;

const getUserPool = () => {
  if (!userPool) {
    const poolData = {
      UserPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
      ClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
    };
    userPool = new CognitoUserPool(poolData);
  }
  return userPool;
};

const setDemoSession = (email: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    DEMO_STORAGE_KEYS.session,
    JSON.stringify({ email, loggedAt: new Date().toISOString() })
  );
  localStorage.setItem(DEMO_STORAGE_KEYS.userId, DEMO_DEFAULT_USER_ID);
};

const clearDemoSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_STORAGE_KEYS.session);
  localStorage.removeItem(DEMO_STORAGE_KEYS.userId);
};

export interface SignUpParams {
  email: string;
  password: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export const signUp = async (params: SignUpParams): Promise<any> => {
  const { email, password } = params;

  if (IS_DEMO_MODE) {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }
    return { userSub: DEMO_DEFAULT_USER_ID, userConfirmed: false };
  }

  const attributeList = [
    new CognitoUserAttribute({ Name: 'email', Value: email }),
  ];

  return new Promise((resolve, reject) => {
    getUserPool().signUp(email, password, attributeList, [], async (err, result) => {
      if (err) {
        await logActivity({
          email,
          activityType: 'SIGNUP_FAILED',
          metadata: { error: err.message },
        });
        reject(err);
        return;
      }
      await logActivity({
        userId: result?.userSub,
        email,
        activityType: 'SIGNUP_SUCCESS',
      });
      resolve(result);
    });
  });
};

export const confirmSignUp = async (email: string, code: string): Promise<any> => {
  if (IS_DEMO_MODE) {
    if (!email || !code) throw new Error('Email y código son requeridos');
    return 'SUCCESS';
  }

  const userData = {
    Username: email,
    Pool: getUserPool(),
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const resendConfirmationCode = async (email: string): Promise<any> => {
  if (IS_DEMO_MODE) {
    if (!email) throw new Error('Email es requerido');
    return 'SUCCESS';
  }

  const userData = {
    Username: email,
    Pool: getUserPool(),
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const signIn = async (params: SignInParams): Promise<any> => {
  const { email, password } = params;

  if (IS_DEMO_MODE) {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }
    setDemoSession(email);
    await logActivity({
      userId: DEMO_DEFAULT_USER_ID,
      email,
      activityType: 'LOGIN_SUCCESS',
      metadata: { mode: 'demo' },
    });
    return { demo: true, email };
  }

  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const userData = {
    Username: email,
    Pool: getUserPool(),
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async (result) => {
        const userId = result.getIdToken().payload.sub;
        await logActivity({
          userId,
          email,
          activityType: 'LOGIN_SUCCESS',
        });
        resolve(result);
      },
      onFailure: async (err) => {
        await logActivity({
          email,
          activityType: 'LOGIN_FAILED',
          metadata: { error: err.message },
        });
        reject(err);
      },
      newPasswordRequired: (userAttributes) => {
        // When admin creates a user, Cognito requires a password change on first login.
        // Complete the challenge using the same password the user just entered.
        delete userAttributes.email_verified;
        delete userAttributes.email;
        cognitoUser.completeNewPasswordChallenge(password, userAttributes, {
          onSuccess: async (result) => {
            const userId = result.getIdToken().payload.sub;
            await logActivity({
              userId,
              email,
              activityType: 'LOGIN_SUCCESS',
              metadata: { newPasswordCompleted: true },
            });
            resolve(result);
          },
          onFailure: async (err) => {
            await logActivity({
              email,
              activityType: 'LOGIN_FAILED',
              metadata: { error: err.message, challenge: 'newPasswordRequired' },
            });
            reject(err);
          },
        });
      },
    });
  });
};

export const signOut = async (): Promise<void> => {
  if (IS_DEMO_MODE) {
    clearDemoSession();
    return;
  }

  const cognitoUser = getUserPool().getCurrentUser();
  if (cognitoUser) {
    const email = cognitoUser.getUsername();
    cognitoUser.signOut();
    await logActivity({
      email,
      activityType: 'LOGOUT',
    });
  }
};

export const getCurrentUser = (): CognitoUser | null => {
  if (IS_DEMO_MODE) return null;
  return getUserPool().getCurrentUser();
};

export const getUserAttributes = async (): Promise<any> => {
  if (IS_DEMO_MODE) {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(DEMO_STORAGE_KEYS.session);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { email?: string };
      return { email: parsed.email || 'demo@quiniela.local' };
    } catch {
      return { email: 'demo@quiniela.local' };
    }
  }

  const cognitoUser = getCurrentUser();
  
  if (!cognitoUser) {
    return null;
  }

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        const attrs: any = {};
        attributes?.forEach((attr) => {
          attrs[attr.Name] = attr.Value;
        });

        resolve(attrs);
      });
    });
  });
};

export const getUserId = async (): Promise<string | null> => {
  if (IS_DEMO_MODE) {
    if (typeof window === 'undefined') return DEMO_DEFAULT_USER_ID;
    return localStorage.getItem(DEMO_STORAGE_KEYS.userId) || DEMO_DEFAULT_USER_ID;
  }

  const cognitoUser = getCurrentUser();
  
  if (!cognitoUser) {
    return null;
  }

  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err: any, session: any) => {
      if (err) {
        reject(err);
        return;
      }

      const payload = session.getIdToken().payload;
      resolve(payload.sub || null);
    });
  });
};

export const isAuthenticated = async (): Promise<boolean> => {
  if (IS_DEMO_MODE) {
    if (typeof window === 'undefined') return true;
    return Boolean(localStorage.getItem(DEMO_STORAGE_KEYS.session));
  }

  const cognitoUser = getCurrentUser();
  
  if (!cognitoUser) {
    return false;
  }

  return new Promise((resolve) => {
    cognitoUser.getSession((err: any, session: any) => {
      if (err || !session.isValid()) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

export const forgotPassword = async (email: string): Promise<any> => {
  if (IS_DEMO_MODE) {
    if (!email) throw new Error('Email es requerido');
    return 'SUCCESS';
  }

  const userData = {
    Username: email,
    Pool: getUserPool(),
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.forgotPassword({
      onSuccess: async (result) => {
        await logActivity({
          email,
          activityType: 'PASSWORD_RESET_REQUEST',
        });
        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

export const confirmForgotPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<any> => {
  if (IS_DEMO_MODE) {
    if (!email || !code || !newPassword) {
      throw new Error('Completa todos los campos requeridos');
    }
    return 'Password reset successful';
  }

  const userData = {
    Username: email,
    Pool: getUserPool(),
  };

  const cognitoUser = new CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: async () => {
        await logActivity({
          email,
          activityType: 'PASSWORD_RESET_SUCCESS',
        });
        resolve('Password reset successful');
      },
      onFailure: async (err) => {
        await logActivity({
          email,
          activityType: 'PASSWORD_CHANGE_FAILED',
          metadata: { error: err.message },
        });
        reject(err);
      },
    });
  });
};
