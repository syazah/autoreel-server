import jwt from "jsonwebtoken";

export class JWTService {
    private static instance: JWTService;
    private accessSecret = process.env.JWT_ACCESS_SECRET!;
    private refreshSecret = process.env.JWT_REFRESH_SECRET!;

    public static getInstance(): JWTService {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        }
        return JWTService.instance;
    }

    public signAccessToken(userId: string): string {
        return jwt.sign(
            { userId, type: "access" },
            this.accessSecret,
            { expiresIn: "15m" }
        );
    }

    public signRefreshToken(userId: string, tokenVersion: number): string {
        return jwt.sign(
            { userId, tokenVersion, type: "refresh" },
            this.refreshSecret,
            { expiresIn: "30d" }
        );
    }

    public verifyAccessToken(token: string) {
        return jwt.verify(token, this.accessSecret);
    }

    public verifyRefreshToken(token: string) {
        return jwt.verify(token, this.refreshSecret);
    }
}
