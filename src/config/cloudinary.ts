import { v2 as cloudinary } from "cloudinary";
import env from "env-var";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: env.get("CLOUDINARY_CLOUD_NAME").required().asString(),
  api_key: env.get("CLOUDINARY_API_KEY").required().asString(),
  api_secret: env.get("CLOUDINARY_API_SECRET").required().asString(),
  secure: true,
});

export default cloudinary;
