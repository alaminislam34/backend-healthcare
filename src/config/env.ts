import dotenv from "dotenv";
import AppError from "../app/errorHelpers/AppError";
import status from "http-status";
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
  BETTER_AUTH_SESSION_TOKEN_UPDATE_EXPIRES_IN: string;
  EMAIL_SENDER_SMTP_HOST: string;
  EMAIL_SENDER_SMTP_PORT: string;
  EMAIL_SENDER_SMTP_USER: string;
  EMAIL_SENDER_SMTP_PASS: string;
  EMAIL_SENDER_SMTP_FROM: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FRONTEND_URL: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

const envConfig = (): EnvConfig => {
  const requiredVars = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_EXPIRES_IN",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_FROM",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  requiredVars.forEach((variable) => {
    if (!process.env[variable]) {
      throw new AppError(
        status.BAD_REQUEST,
        `Missing required environment variable: ${variable}, please check your .env file`,
      );
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV!,
    PORT: process.env.PORT!,
    DATABASE_URL: process.env.DATABASE_URL!,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN!,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN!,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN:
      process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN!,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_EXPIRES_IN:
      process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_EXPIRES_IN!,
    EMAIL_SENDER_SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST!,
    EMAIL_SENDER_SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT!,
    EMAIL_SENDER_SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER!,
    EMAIL_SENDER_SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS!,
    EMAIL_SENDER_SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
  };
};

export const envVars = envConfig();
