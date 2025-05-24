import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
//ตอนสร้าง class ที่ extends passportStrategy(Strategy) มันจะลงทะเบียนเจ้านี่ 
//โดย default ถูกตั้งว่า local จากการใช้ passport-local, ถ้าเป็น passport-jwt ก็จะถูกตั้งชื่อว่า jwt
//เปลี่ยนชื่อได้ด้วยการส่ง argument ไปอีกตัว ต่อจาก Strategy => PassportStrategy(Strategy, 'ชื่ออะไรสักอย่าง')
//แล้วใน AuthGuard เราใช้ชื่อ 'local' เพื่อเรียก strategy นี้
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
        //โดย default มันจะรับแบบ { username : "" , password : ""} แต่อันนี้เหล่าอยากเปลี่ยน field เป็น email แทน
        usernameField: 'email', 
    });
  }

  async validate(email: string, password: string) {
    if (password === '') throw new UnauthorizedException('Please Provide The Password');
    return this.authService.validateUser(email, password);
    //จะถูกเก็บลงใน req.user อัตโตมัติ ถ้าจะเปลี่ยนมันยุ่งยาก แต่ทำได้
    //่เช่น return จาก this.authService.validateUser(email, password) => { id: ค่าไอดี, role: โรล }
    //ซึ่งสามารถเข้าถึง ค่าไอดี โดย req.user.id
  }
}