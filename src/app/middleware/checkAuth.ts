import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

export const checkAuth =
  (...authRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = cookieUtils.getCookie(
        req,
        "better-auth.session_token",
      );

      if (!sessionToken) {
        throw new AppError(
          status.UNAUTHORIZED,
          "Unauthorized access. No session token provided.",
        );
      }

      if (sessionToken) {
        const sessionExists = await prisma.session.findUnique({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            user: true,
          },
        });

        if (sessionExists && sessionExists.user) {
          const user = sessionExists.user;
          const now = new Date();
          const expiresAt = sessionExists.expiresAt;
          const createdAt = sessionExists.createdAt;
          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const remainingTime = expiresAt.getTime() - now.getTime();
          const percentRemaining = (remainingTime / sessionLifeTime) * 100;

          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toString());
            res.setHeader("X-Time-Remaining", remainingTime.toString());

            console.log("Session Expiring soon!!");
          }

          if (
            user.status === UserStatus.BLOCKED ||
            user.status === UserStatus.DELETED
          ) {
            throw new AppError(status.FORBIDDEN, "Unauthorized access.");
          }
          if (authRoles.length > 0 && !authRoles.includes(user.role)) {
            throw new AppError(
              status.FORBIDDEN,
              "Unauthorized access. You do not have permission to access this resource.",
            );
          }
          if (user.isDeleted) {
            throw new AppError(
              status.UNAUTHORIZED,
              "Unauthorized access. User account is deleted.",
            );
          }

          if (authRoles.length > 0 && !authRoles.includes(user.role)) {
            throw new AppError(
              status.FORBIDDEN,
              "Unauthorized access. You do not have permission to access this resource.",
            );
          }

          req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
          };
        }

        const accessToken = cookieUtils.getCookie(req, "accessToken");
        if (!accessToken) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access. No access token provided.",
          );
        }

        const verifiedToken = jwtUtils.verifyToken(
          accessToken,
          envVars.ACCESS_TOKEN_SECRET,
        );

        if (!verifiedToken.success) {
          throw new AppError(
            status.UNAUTHORIZED,
            "Unauthorized access. Invalid access token.",
          );
        }

        if (
          authRoles.length > 0 &&
          !authRoles.includes(verifiedToken.data.role as UserRole)
        ) {
          throw new AppError(
            status.FORBIDDEN,
            "Unauthorized access. You do not have permission to access this resource.",
          );
        }
        next();
      }
    } catch (error) {
      next(error);
    }
  };
