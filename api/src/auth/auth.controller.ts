import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth/local-auth-guard';
import { RefreshJwTAuthGuard } from './guards/refresh-jwt-auth/refresh-jwt-auth-guard';
import { JwTAuthGuard } from './guards/jwt-auth/jwt-auth-guard';
import { Roles } from './decorators/role.decorator';
import { UserRole } from './enums/role.enum';
import { RolesGuard } from './guards/roles/roles.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth-guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req){
    return this.authService.login(req.user.id)
  }

  @UseGuards(RefreshJwTAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@Request() req){
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwTAuthGuard)
  @Post('logout')
  signOut(@Request() req) {
    return this.authService.signOut(req.user.id);
  }

  @UseGuards(JwTAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('test')
  test(@Request() req) {
    return req.user;
  }

  @Public()
  @UseGuards(GoogleAuthGuard) // ใช้ GoogleStrategy ผ่าน GoogleAuthGuard
  @Get('google/login')
  googleLogin() {} // ไม่ต้องใส่อะไร Passport จะ redirect ไป Google ให้เอง

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req, @Request() res) {
    // หลังจาก google auth สำเร็จ req.user จะมีข้อมูล user ที่ login แล้ว
    const response = await this.authService.login(req.user.id); // สร้าง JWT token

    // redirect ไปหน้า frontend พร้อมแนบ access token ไปด้วย
    res.redirect(`http://localhost:5173?token=${response.accessToken}`);
  }
}
