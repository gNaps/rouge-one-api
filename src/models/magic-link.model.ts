export interface MagicLinkCreate {
  token: string;
  expired_at: Date;
  email: string;
  for_user: boolean;
  for_people: boolean;
  project_id: number;
}
