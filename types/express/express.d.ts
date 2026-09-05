import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload;
    uploadedAvatar?: {
      imageUrl: string;
      publicId: string;
    };
  }
}
