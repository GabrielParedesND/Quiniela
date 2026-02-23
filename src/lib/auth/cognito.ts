import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { logActivity } from '@/lib/logger/activity';

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
    });
  });
};

export const signOut = async (): Promise<void> => {
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
  return getUserPool().getCurrentUser();
};

export const getUserAttributes = async (): Promise<any> => {
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
