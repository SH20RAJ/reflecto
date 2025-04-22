import { auth } from "@/auth";

export const authOptions = {
  providers: auth.providers,
  adapter: auth.adapter,
  session: auth.session,
  callbacks: auth.callbacks,
  pages: auth.pages,
};
