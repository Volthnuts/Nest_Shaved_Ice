import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";

export default registerAs('refreshJwt', (): JwtModuleOptions => ({
        secret: process.env.REFRESH_JWT_SECRET,
        signOptions: {
            expiresIn: process.env.REFRESH_JWT_EXPIRE_IN
        },
    }),
);