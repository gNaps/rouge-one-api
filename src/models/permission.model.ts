import { Querystring } from "./querystring.model";

export interface PermissionCreate {
  name: string;
  role_id?: number;
  project_id: number;
}

export interface PermissionFindMany extends Querystring {
  name: string;
  project_id: number;
}

export interface PermissionUpdate {
  id: number;
  name: string;
  role_id: number;
}
