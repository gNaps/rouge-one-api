import { Querystring } from "./querystring.model";

export interface RoleCreate {
  name: string;
  project_id: number;
  is_default: boolean;
}

export interface RoleFindMany extends Querystring {
  name: string;
  project_id: number;
}

export interface RoleUpdate {
  id: number;
  name: string;
  is_default: boolean;
}
