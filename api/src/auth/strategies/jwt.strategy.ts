import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJWTPayload } from 'src/auth/configs/authJwtPayload';
import { AuthService } from "../auth.service";

@Injectable()
export class JwTStrategy extends PassportStrategy(Strategy){
    constructor(
        configService: ConfigService,
        private authService: AuthService
    ){
        const secret = configService.get<string>('jwt.secret');
        if (!secret) {
            throw new Error('JWT secret is not defined in the configuration.');
        }

        // เรียก constructor ของ PassportStrategy โดยกำหนดวิธี extract token และ secret สำหรับ verify
        // ตรงนี้คือส่วน verify ถ้าสำเร็จจจะไป validate ต่อ
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    // method ที่จะถูกเรียก หลังจาก JWT ผ่านการ verify แล้ว และค่าที่ return จากตรงนี้ จะกลายเป็น req.user
    validate(payload: AuthJWTPayload) {
        // payload คือข้อมูลที่ decode ออกมาจาก JWT (เช่น { id, role, iat, exp })
        // AuthJWTPayload คือโครงสร้างที่เรากำหนดไว้ ป้องกันค่าพิมพ์ผิด ไรงี้มั้ง
        const userId = payload.id;
        return this.authService.validateJwtUser(userId);

        // req.user ถูกสร้างจากข้อมูลที่ return จาก validate()
    }
}