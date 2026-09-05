import { CookieOptions, Request, Response } from "express";

const COOKIE_NAME = "synctime_refresh";

const getTtlDays = (): number => {
  const configuredDays = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
  return Number.isInteger(configuredDays) &&
    configuredDays >= 1 &&
    configuredDays <= 30
    ? configuredDays
    : 7;
};

const getCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api",
  };
};

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string
): void => {
  res.cookie(COOKIE_NAME, refreshToken, {
    ...getCookieOptions(),
    maxAge: getTtlDays() * 24 * 60 * 60 * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
};

export const getRefreshTokenCookie = (req: Request): string | null => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const separatorIndex = cookie.indexOf("=");
    if (separatorIndex < 0) continue;

    const name = cookie.slice(0, separatorIndex).trim();
    if (name !== COOKIE_NAME) continue;

    try {
      return decodeURIComponent(cookie.slice(separatorIndex + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
};
