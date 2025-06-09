import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RefreshJwTAuthGuard extends AuthGuard('refresh-jwt') {}