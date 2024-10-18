import { Querystring } from "./querystring.model";

export interface PeopleSignup {
  email: string;
  password: string;
  username: string;
  project_id: number;
  firstname: string;
  surname: string;
  provider: string;
  role_id: number;
  image: string;
  verified: boolean;
}

export interface PeopleSignin {
  email?: string;
  password?: string;
  type: "password" | "provider" | "magic";
  project_id: number;
}

export interface PeopleFindMany extends Querystring {
  email: string;
  project_id: number;
}

export interface PeopleCreate {}

export interface PeopleUpdate {
  email: string;
  password: string;
  username: string;
  project_id: number;
  firstname: string;
  surname: string;
  provider: string;
  role_id: number;
  image: string;
  verified: boolean;
  meta_data: string;
  last_login: Date;
  count_login: number;
  id: number;
}
