import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import env from "env-var";
import { Middleware } from "@/presentation/protocols/middleware";
import cloudinary from "@/config/cloudinary";
import * as fs from "fs";

const ensureTempDir = () => {
  const tempDir = env.get("UPLOAD_TEMP_DIR").default("uploads/temp").asString();
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log(`Pasta temp criada: ${tempDir}`);
  }
};

ensureTempDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = env
      .get("UPLOAD_TEMP_DIR")
      .default("uploads/temp")
      .asString();
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const makeUploadUserMiddleware = (): Middleware => {
  const unifiedMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    return new Promise<void>((resolve, reject) => {
      upload.single("avatar")(req, res, (err?: any) => {
        if (err) {
          if (req.file?.path) {
            try {
              fs.unlinkSync(req.file.path);
            } catch {}
          }
          return reject(err);
        }
        resolve();
      });
    })
      .then(async () => {
        if (!req.file) {
          return next();
        }

        try {
          let fileData: Buffer;
          if (req.file.buffer) {
            fileData = req.file.buffer;
          } else {
            if (!fs.existsSync(req.file.path!)) {
              throw new Error(
                `Arquivo temp não encontrado: ${req.file.path}. Verifique permissões.`
              );
            }
            fileData = fs.readFileSync(req.file.path!);
          }

          const originalNameWithoutExt =
            path.parse(req.file.originalname).name + "_" + Date.now();

          const uploadResult = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "users/avatars",
                public_id: originalNameWithoutExt,
                transformation: [
                  { width: 300, height: 300, crop: "fill", gravity: "face" },
                ],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(fileData);
          });

          (req as any).body.imageUrl = uploadResult.secure_url;
          (req as any).body.publicId = uploadResult.public_id;

          if (req.file!.path && !req.file!.buffer) {
            try {
              fs.unlinkSync(req.file!.path);
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              console.warn("Falha no cleanup:", message);
            }
          }

          next();
        } catch (error) {
          if (req.file?.path && !req.file?.buffer) {
            try {
              fs.unlinkSync(req.file.path);
            } catch {}
          }
          return res.status(400).json({
            error: "Erro no upload da imagem: " + (error as Error).message,
          });
        }
      })
      .catch((error) => {
        return res
          .status(400)
          .json({ error: error.message || "Erro no processamento do arquivo" });
      });
  };

  return {
    handle: unifiedMiddleware,
  };
};
