import { Get, Injectable, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { compare,hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJWTPayload } from 'src/configs/jwtConfig';
import { JwTAuthGuard } from './guards/jwt-auth/jwt-auth-guard';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    async validateUser( email: string, password: string ){
        const user = await this.userService.findUserByEmail(email);
        if(!user) throw new UnauthorizedException('Usr not found');

        const isMatch = await compare(password, user.password);
        if(!isMatch) throw new UnauthorizedException('Password not match')

        return { id: user.id,
                role: user.role
        }
    }

    login(userId: string, userRole: string){
        const payload:AuthJWTPayload = { id: userId , role: userRole};
        return this.jwtService.sign(payload)
    }
}
