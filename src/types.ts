export type Role = "team_member" | "manager";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}