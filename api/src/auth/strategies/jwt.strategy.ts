import { Injectable } from "@nestjs/common";
import { ConfigService, ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import jwtConfig, { AuthJWTPayload } from 'src/configs/jwtConfig';

@Injectable()
export class JwTStrategy extends PassportStrategy(Strategy){
    constructor(
        configService: ConfigService,
    ){
        const secret = configService.get<string>('jwt.secret');
        if (!secret) {
            throw new Error('JWT secret is not defined in the configuration.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    validate(payload: AuthJWTPayload) {
        const userId = payload.id;
        const userRole = payload.role
        return { id: userId,
                role: userRole
         } 
    }
}