
import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthTokenPayload extends JwtPayload {
    userId: string;
}

export async function getCurrentUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth_token")?.value;

        if (!token) {
            return null;
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error("JWT_SECRET is missing.");
            return null;
        }

        const decoded = jwt.verify(token, jwtSecret);

        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "string"
        ) {
            return null;
        }

        return decoded.userId;
    } catch {
        return null;
    }
}
