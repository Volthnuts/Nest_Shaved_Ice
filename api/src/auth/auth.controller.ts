import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth/local-auth-guard';
import { JwTAuthGuard } from './guards/jwt-auth/jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req){
    const token = this.authService.login(req.user.id, req.user.role)
    return { 
      id: req.user.id, 
      token: token 
    }
  }
}
