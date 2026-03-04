export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
  sessionToken: string;
}

export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

