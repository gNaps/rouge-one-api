import { Querystring } from "./querystring.model";

export interface ProjectCreate {
  google_client_id: string;
  google_secret_id: string;
  facebook_client_id: string;
  facebook_secret_id: string;
  twitch_client_id: string;
  twitch_secret_id: string;
  github_client_id: string;
  github_secret_id: string;
  is_google_active: boolean;
  is_facebook_active: boolean;
  is_twitch_active: boolean;
  is_password_active: boolean;
  is_magic_link_active: boolean;
  redirect_url: string;
  user_id: number;
  name: string;
  description: string;
}

export interface ProjectUpdate {
  google_client_id: string;
  google_secret_id: string;
  facebook_client_id: string;
  facebook_secret_id: string;
  twitch_client_id: string;
  twitch_secret_id: string;
  github_client_id: string;
  github_secret_id: string;
  is_google_active: boolean;
  is_facebook_active: boolean;
  is_twitch_active: boolean;
  is_password_active: boolean;
  is_magic_link_active: boolean;
  redirect_url: string;
  description: string;
  id: number;
}

export interface ProjectFindMany extends Querystring {
  name: string;
  user_id: number;
}
