import { UserRole } from "../../generated/prisma/enums";

export interface IRequestUser {
  userId: string;
  email: string;
  role: UserRole;
}
