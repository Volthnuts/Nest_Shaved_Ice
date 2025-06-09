import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import jwtConfig from 'src/auth/configs/jwtConfig';
import { UsersService } from 'src/users/users.service';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { JwTStrategy } from './strategies/jwt.strategy';
import refresh_jwtConfig from 'src/auth/configs/refresh_jwtConfig';
import { RefreshJwTStrategy } from './strategies/refresh.jwt.strategy';
import google_oauth from 'src/auth/configs/google_oauth';

@Module({
  imports: [
    TypeOrmModule.forFeature([ User ]),
    JwtModule.registerAsync(jwtConfig.asProvider()), // jwtService.sign(payload) จะใช้ config ของ jwtConfig, มันจะไม่งงไปใช้ของ refresh เพราะเรา registerAsync ของ jwtConfig ไปแล้ว
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refresh_jwtConfig), // โยน Config ของ refresh เข้าไป เพื่อเอาไปใช้ใน auth
    ConfigModule.forFeature(google_oauth)
  ],
  controllers: [AuthController],
  providers: [AuthService,
              UsersService,
              LocalStrategy,
              JwTStrategy,
              RefreshJwTStrategy
  ],
})
export class AuthModule {}
