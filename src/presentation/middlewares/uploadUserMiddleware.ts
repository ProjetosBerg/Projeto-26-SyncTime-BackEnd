import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import env from "env-var";
import { Middleware } from "@/presentation/protocols/middleware";
import cloudinary from "@/config/cloudinary";
import * as fs from "fs";
import logger from "@/loaders/logger";
import { ResponseStatus } from "@/utils/service";

class UploadValidationError extends Error {}

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
  const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new UploadValidationError(
        "Formato de imagem não permitido. Use JPEG, PNG ou WebP."
      )
    );
  }
};

const detectImageMimeType = (fileData: Buffer): string | null => {
  if (
    fileData.length >= 3 &&
    fileData[0] === 0xff &&
    fileData[1] === 0xd8 &&
    fileData[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    fileData.length >= 8 &&
    fileData.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return "image/png";
  }

  if (
    fileData.length >= 12 &&
    fileData.subarray(0, 4).toString("ascii") === "RIFF" &&
    fileData.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
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

          const detectedMimeType = detectImageMimeType(fileData);
          if (!detectedMimeType || detectedMimeType !== req.file.mimetype) {
            throw new UploadValidationError(
              "O conteúdo do arquivo não corresponde a uma imagem válida"
            );
          }

          const safePublicId = `avatar_${Date.now()}_${Math.round(
            Math.random() * 1e9
          )}`;

          const uploadResult = await new Promise<any>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: "users/avatars",
                public_id: safePublicId,
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

          req.uploadedAvatar = {
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          };

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
          if (error instanceof UploadValidationError) {
            return res.status(400).json({
              status: ResponseStatus.BAD_REQUEST,
              message: error.message,
            });
          }

          logger.error(
            `Falha interna no upload do avatar: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          return res.status(500).json({
            status: ResponseStatus.INTERNAL_SERVER_ERROR,
            message: "Erro interno ao processar a imagem",
          });
        }
      })
      .catch((error) => {
        if (error instanceof multer.MulterError) {
          return res.status(400).json({
            status: ResponseStatus.BAD_REQUEST,
            message:
              error.code === "LIMIT_FILE_SIZE"
                ? "A imagem deve ter no máximo 5 MB"
                : "Arquivo de imagem inválido",
          });
        }

        if (error instanceof UploadValidationError) {
          return res.status(400).json({
            status: ResponseStatus.BAD_REQUEST,
            message: error.message,
          });
        }

        logger.error(
          `Falha ao processar upload: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        return res.status(500).json({
          status: ResponseStatus.INTERNAL_SERVER_ERROR,
          message: "Erro interno ao processar a imagem",
        });
      });
  };

  return {
    handle: unifiedMiddleware,
  };
};
