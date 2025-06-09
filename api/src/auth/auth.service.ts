import { Get, Inject, Injectable, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJWTPayload } from 'src/auth/configs/authJwtPayload';
import refresh_jwtConfig from 'src/auth/configs/refresh_jwtConfig';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CurrentUser } from 'src/auth/configs/currentUser';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateGoogleUserDto } from 'src/users/dto/create-user-google.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService,
            @Inject(refresh_jwtConfig.KEY) 
            private refreshTokenConfig:ConfigType<typeof refresh_jwtConfig>
    ) {}

    async validateUser( email: string, password: string ){
        const user = await this.userService.findUserByEmail(email);
        if(!user) throw new UnauthorizedException('User not found');

        // const isMatch = await argon2.verify( user.password,password);
        const isMatch = await compare( password,user.password);
        if(!isMatch) throw new UnauthorizedException('Password not match')

        return { id: user.id }
    }

    async login(userId: string) {
        const { accessToken, refreshToken } = await this.generateTokens(userId);
        const hashedRefreshToken = await argon2.hash(refreshToken);
        await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
        return {
            id: userId,
            accessToken: accessToken,
            refreshToken: refreshToken,
        };
  }
  
    async generateTokens(userId: string) {
        const payload: AuthJWTPayload = { id: userId };
        const { secret, signOptions } = this.refreshTokenConfig;
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, {
                secret,
                ...signOptions, // เอา object ใน signOption แผ่ออกมา => signOption : { expireIn : 7d } เป็น expireIn : 7d
            }
        )]);
        return {
            accessToken,
            refreshToken,
        };
    }

    async refreshToken(userId: string){
        const payload:AuthJWTPayload = { id: userId };
        const token = this.jwtService.sign(payload);
        return ({
            token: token,
        })
    }

    async validateRefreshToken(userId: string,refreshToken: string){
        const user = await this.userService.findOne(userId);
        if(!user || !user.hashedRefreshToken) throw new UnauthorizedException('Invalid refresh token');

        const refreshTokenMatche = await argon2.verify( user.hashedRefreshToken,refreshToken );
        if (!refreshTokenMatche) throw new UnauthorizedException('Invalid Refresh Token');

        return {
            id: userId,
        }
    }

    async signOut(userId: string) {
        await this.userService.updateHashedRefreshToken(userId, null);
    }

    async validateJwtUser(userId: string) {
        const user = await this.userService.findOne(userId);
        if (!user) throw new UnauthorizedException('User not found!');
        
        const currentUser: CurrentUser = { id: user.id, role: user.role }; //ตอน jwt เอาไปหา roled มาด้วย
        // CurrentUser คือรูปแบบข้อมูลที่จะส่ง
        return currentUser;
    }

    async validateGoogleUser(createGoogleUserDto: CreateGoogleUserDto) {
        const user = await this.userService.findUserByEmail(createGoogleUserDto.email);
        if (user) return user;
        
        return await this.userService.registerGoogle(createGoogleUserDto);
    }
}