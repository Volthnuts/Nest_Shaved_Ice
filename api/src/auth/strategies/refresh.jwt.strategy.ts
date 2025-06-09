import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJWTPayload } from 'src/auth/configs/authJwtPayload';
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshJwTStrategy extends PassportStrategy(Strategy, 'refresh-jwt'){
    constructor(
        configService: ConfigService,
        private authService: AuthService
    ){
        const secret = configService.get<string>('refreshJwt.secret');
        if (!secret) {
            throw new Error('JWT secret is not defined in the configuration.');
        }

        // เรียก constructor ของ PassportStrategy โดยกำหนดวิธี extract token และ secret สำหรับ verify
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
            ignoreExpiration: false,
            passReqToCallback: true
        });
    }

    validate(req:Request, payload: AuthJWTPayload) {
        // payload คือข้อมูลที่ decode ออกมาจาก JWT (เช่น { id, role, iat, exp })
        // AuthJWTPayload คือโครงสร้างที่เรากำหนดไว้ ป้องกันค่าพิมพ์ผิด ไรงี้มั้ง
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            throw new UnauthorizedException('No authorization header');
        }

        const refreshToken = authHeader.replace('Bearer','').trim();
        const userId = payload.id;
        
        return this.authService.validateRefreshToken(userId, refreshToken);
    }
}