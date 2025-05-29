import { UserRole } from "src/auth/enums/role.enum";

export type CurrentUser = {
  id: string;
  role: UserRole;
};