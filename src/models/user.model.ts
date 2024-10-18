export interface UserSignup {
  email: string;
  password: string;
  image: string;
  firstname: string;
  surname: string;
  provider: string;
  verified: boolean;
}

export interface UserSignin {
  email: string;
  password: string;
}
