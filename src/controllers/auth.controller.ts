import axios from "axios";
import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { PeopleSignin, PeopleSignup } from "../models/people.model";
import { Queryparams } from "../models/queryparams.model";
import { UserSignin, UserSignup } from "../models/user.model";
import { magicLinkService } from "../services/magic-link.service";
import { peopleService } from "../services/people.service";
import { projectService } from "../services/project.service";
import { roleService } from "../services/role.service";
import { userService } from "../services/user.service";

export const authController = async (fastify: FastifyInstance) => {
  // [ROUGE ONE] Sign up user by username and password
  fastify.post<{ Body: UserSignup }>("/sign-up", async (req, rep) => {
    const { email, password } = req.body;
    const cryptedPassword = bcrypt.hashSync(
      password,
      Number(process.env.SALT_ROUNDS)
    );
    const user = await userService.createOne({
      email,
      password: cryptedPassword,
    });
    const token = jwt.sign(user, process.env.SECRET_KEY_JWT!, {
      expiresIn: 86400,
    });
    await userService.setNewSignin(user.id);
    return { token };
  });

  // [ROUGE ONE] Sign in user by username and password
  fastify.post<{ Body: UserSignin }>("/sign-in", async (req, rep) => {
    const { email, password } = req.body;
    const user = await userService.findOneByEmail({ email });
    if (!user || !user.password) {
      rep.code(404).send("Invalid credentials");
      return;
    }
    const isPasswordValid = bcrypt.compareSync(user.password, password);
    if (!isPasswordValid) {
      rep.code(404).send("Invalid credentials!");
      return;
    }
    const token = jwt.sign(user, process.env.SECRET_KEY_JWT!, {
      expiresIn: 86400,
    });
    await userService.setNewSignin(user.id);
    return { token };
  });

  // [ROUGE ONE] Sign in user by google
  fastify.get("/sign-in/google", async (req, rep) => {
    const url = `${process.env.GOOGLE_OAUTH_URL}?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile email`;
    rep.redirect(url);
  });

  // [ROUGE ONE] Callback sign in user by google
  fastify.get<{ Querystring: { code: string } }>(
    "/sign-in/google/callback",
    async (req, rep) => {
      const { code } = req.query;
      const { data } = await axios.post(process.env.GOOGLE_OAUTH_TOKEN_URL!, {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      });
      const { access_token } = data;
      const { data: profile } = await axios.get(
        process.env.GOOGLE_USERINFO_URL!,
        {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }
      );
      let user = await userService.findOneByEmail({ email: profile.email });
      if (!user) {
        user = await userService.createOne({
          email: profile.email,
          firstname: profile.given_name,
          surname: profile.family_name,
          image: profile.picture,
          provider: "google",
          verified: true,
        });
      }
      const token = jwt.sign(user, process.env.SECRET_KEY_JWT!, {
        expiresIn: 86400,
      });
      await userService.setNewSignin(user.id);
      rep.redirect(
        `${process.env.ROUGE_ONE_FE_URL}/auth/callback?token=${token}`
      );
    }
  );

  // [ROUGE ONE] Sign in user by magic link
  fastify.post<{ Body: UserSignin }>(
    "/sign-in/magic-link",
    async (req, rep) => {
      const { email } = req.body;
      const magicLink = await magicLinkService.createOne({
        email,
        for_user: true,
        for_people: false,
      });

      // Here you should send the magic link to the user's email

      return magicLink;
    }
  );

  // [ROUGE ONE] Callback sign in user by magic link
  fastify.get<{ Querystring: { token: string } }>(
    "/sign-in/magic-link/callback",
    async (req, rep) => {
      const { token } = req.query;
      const magicLink = await magicLinkService.findOneByToken(token);

      if (!magicLink) {
        rep.code(404).send("Magic link not found");
        return;
      }

      const now = new Date();
      const diffInMilliseconds =
        magicLink.expired_at!.getTime() - now.getTime();

      if (diffInMilliseconds < 0) {
        rep.code(404).send("Magic link expired");
        return;
      } else {
        const user = await userService.findOneByEmail({
          email: magicLink.email,
        });

        if (!user) {
          rep.code(404).send("User not found");
          return;
        }

        const token = jwt.sign(user, process.env.SECRET_KEY_JWT!, {
          expiresIn: 86400,
        });

        await userService.setNewSignin(user.id);
        await magicLinkService.deleteOne(magicLink.id);

        rep.redirect(
          `${process.env.ROUGE_ONE_FE_URL}/auth/callback?token=${token}`
        );
      }
    }
  );

  // AUTH PROJECTS

  // [PROJECT] Sign up people by username and password
  fastify.post<{ Body: PeopleSignup; Params: Queryparams }>(
    "/:tenant_code/sign-up",
    async (req, rep) => {
      const { tenant_code } = req.params;
      const project = await projectService.findOneByTenantCode(tenant_code);
      if (!project) {
        rep.code(404).send("Invalid tenant code");
        return;
      }

      const defaultRole = await roleService.findDefault(project.id);
      if (!defaultRole) {
        rep.code(404).send("Not default role set");
        return;
      }

      const { email, password } = req.body;
      const cryptedPassword = bcrypt.hashSync(
        password,
        Number(process.env.SALT_ROUNDS)
      );
      const user = await peopleService.createOne({
        email,
        password: cryptedPassword,
        project_id: project.id,
        role_id: defaultRole.id,
      });
      const token = jwt.sign(user, process.env.SECRET_KEY_JWT!, {
        expiresIn: 86400,
      });
      await peopleService.setNewSignin(user.id);
      return { token };
    }
  );

  // [PROJECT] Sign in people by username and password
  fastify.post<{ Body: PeopleSignin; Params: Queryparams }>(
    "/:tenant_code/sign-in",
    async (req, rep) => {
      const { tenant_code } = req.params;
      const project = await projectService.findOneByTenantCode(tenant_code);
      if (!project) {
        rep.code(404).send("Invalid tenant code");
        return;
      }

      const { email, password } = req.body;
      const user = await peopleService.findOneByProject({
        email: email ?? "",
        project_id: project.id,
      });
      if (!user || !user.password) {
        console.log("user not found");
        rep.code(404).send("Invalid credentials");
        return;
      }

      console.log("user.password", user.password);
      console.log("password", password);
      const isPasswordValid = bcrypt.compareSync(password!, user.password);
      if (!isPasswordValid) {
        console.log("password invalid");
        rep.code(404).send("Invalid credentials!");
        return;
      }

      const token = jwt.sign(user, process.env.SECRET_KEY_JWT!, {
        expiresIn: 86400,
      });
      await peopleService.setNewSignin(user.id);

      return { token };
    }
  );

  // [PROJECT] Sign in user by google
  fastify.get<{ Params: Queryparams }>(
    "/:tenant_code/sign-in/google",
    async (req, rep) => {
      const { tenant_code } = req.params;
      const project = await projectService.findOneByTenantCode(tenant_code);
      if (!project) {
        rep.code(404).send("Invalid tenant code");
        return;
      }
      const url = `${process.env.GOOGLE_OAUTH_URL}?client_id=${
        project.google_client_id
      }&redirect_uri=${process.env.GOOGLE_REDIRECT_URI_PROJECT!.replace(
        "{{tenant_code}}",
        tenant_code
      )}&response_type=code&scope=profile email`;
      rep.redirect(url);
    }
  );

  // [PROJECT] Callback sign in user by google
  fastify.get<{ Querystring: { code: string }; Params: Queryparams }>(
    "/:tenant_code/sign-in/google/callback",
    async (req, rep) => {
      const { tenant_code } = req.params;
      const project = await projectService.findOneByTenantCode(tenant_code);
      if (!project) {
        rep.code(404).send("Invalid tenant code");
        return;
      }
      const { code } = req.query;
      const { data } = await axios.post(process.env.GOOGLE_OAUTH_TOKEN_URL!, {
        client_id: project.google_client_id,
        client_secret: project.google_secret_id,
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI_PROJECT!.replace(
          "{{tenant_code}}",
          tenant_code
        ),
        grant_type: "authorization_code",
      });
      const { access_token } = data;
      const { data: profile } = await axios.get(
        process.env.GOOGLE_USERINFO_URL!,
        {
          headers: {
            Authorization: "Bearer " + access_token,
          },
        }
      );
      let user = await peopleService.findOneByProject({
        email: profile.email,
        project_id: project.id,
      });
      if (!user) {
        const defaultRole = await roleService.findDefault(project.id);
        if (!defaultRole) {
          rep.code(404).send("Not default role set");
          return;
        }

        user = await peopleService.createOne({
          email: profile.email,
          firstname: profile.given_name,
          surname: profile.family_name,
          image: profile.picture,
          provider: "google",
          verified: true,
          project_id: project.id,
          role_id: defaultRole.id,
        });
      }
      const token = jwt.sign(user, process.env.SECRET_KEY_JWT!, {
        expiresIn: 86400,
      });
      await userService.setNewSignin(user.id);
      rep.redirect(`${project.redirect_url}/auth/callback?token=${token}`);
    }
  );

  // [PROJECT] Sign in user by magic link
  fastify.post<{ Body: PeopleSignin; Params: Queryparams }>(
    "(/:tenant_code/sign-in/magic-link",
    async (req, rep) => {
      const { tenant_code } = req.params;
      const project = await projectService.findOneByTenantCode(tenant_code);
      if (!project) {
        rep.code(404).send("Invalid tenant code");
        return;
      }

      const { email } = req.body;
      const magicLink = await magicLinkService.createOne({
        email,
        for_user: true,
        for_people: false,
      });

      // Here you should send the magic link to the user's email

      return magicLink;
    }
  );

  // [PROJECT] Callback sign in user by magic link
  fastify.get<{ Querystring: { token: string }; Params: Queryparams }>(
    "/:tenant_code/sign-in/magic-link/callback",
    async (req, rep) => {
      const { tenant_code } = req.params;
      const project = await projectService.findOneByTenantCode(tenant_code);
      if (!project) {
        rep.code(404).send("Invalid tenant code");
        return;
      }

      const { token } = req.query;
      const magicLink = await magicLinkService.findOneByToken(token);

      if (!magicLink) {
        rep.code(404).send("Magic link not found");
        return;
      }

      const now = new Date();
      const diffInMilliseconds =
        magicLink.expired_at!.getTime() - now.getTime();

      if (diffInMilliseconds < 0) {
        rep.code(404).send("Magic link expired");
        return;
      } else {
        const user = await peopleService.findOneByProject({
          email: magicLink.email,
          project_id: project.id,
        });

        if (!user) {
          rep.code(404).send("User not found");
          return;
        }

        const token = jwt.sign(user, process.env.SECRET_KEY_JWT!, {
          expiresIn: 86400,
        });

        await peopleService.setNewSignin(user.id);
        await magicLinkService.deleteOne(magicLink.id);

        rep.redirect(`${project.redirect_url}/auth/callback?token=${token}`);
      }
    }
  );
};
