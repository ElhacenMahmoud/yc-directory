declare module "next-auth" {
  interface Session {
    id: string;
  }
  interface JWS {
    id: string;
  }
}
