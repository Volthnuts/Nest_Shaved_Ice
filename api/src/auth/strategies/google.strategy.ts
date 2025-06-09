import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    // ดึง config ที่เกี่ยวกับ Google จาก .env หรือ config file
    const clinetID = configService.get<string>('googleOAuth.clinetID');
    const clientSecret = configService.get<string>('googleOAuth.clientSecret');
    const callbackURL = configService.get<string>('googleOAuth.callbackURL');

    // ถ้าขาด config ใด ๆ ให้ throw error
    if (!clinetID || !clientSecret || !callbackURL) {
      throw new Error('Google config is not available');
    }

    // เรียก super เพื่อลงทะเบียน strategy กับ Passport โดยใช้ Google OAuth
    super({
      clientID: clinetID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      scope: ['email', 'profile'], // ขอ permission แค่ email และ profile
    });
  }

  // ฟังก์ชัน validate จะถูกเรียกโดย Passport หลังจากยืนยันกับ Google สำเร็จ
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any, // ข้อมูลโปรไฟล์จาก Google
    done: VerifyCallback,
  ) {
    console.log({ profile }); // log โปรไฟล์ที่ได้จาก Google เพื่อดูข้อมูล

    // เรียก service เพื่อจัดการกับ user จาก google login
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      name: profile.name.givenName + ' ' + profile.name.familyName,
      password: '', // สมมุติใส่เป็นค่าว่าง เพราะไม่ใช้รหัสผ่าน
    });

    // ส่งกลับ user ให้ Passport ใช้งานต่อ
    return user;
  }
}