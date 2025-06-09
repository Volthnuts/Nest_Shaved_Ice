import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators/role.decorator';
import { UserRole } from 'src/auth/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} //reflector ใช้เพื่ออ่าน metaData ที่แนบมา

  canActivate(context: ExecutionContext): boolean {
    // ดึง role ที่กำหนดไว้ใน route หรือ controller
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      //เช็คว่ามีการแนบ metadata มาไหม แบบว่ามันเรียกใช้ decorator Roles รึเปล่า
      context.getHandler(), // เช่น @Get(), @Post()
      context.getClass(),   // ตัว controller
    ]);

    if (!requiredRoles) return true; // ถ้า route นี้ไม่ได้กำหนด role ก็ให้ผ่าน

    // ดึงข้อมูล user จาก request (JWTStrategy จะใส่ user ไว้ใน req.user)
    const user = context.switchToHttp().getRequest().user;
    console.log({ user }); // Debug ดู role ที่มาจาก token

    // ตรวจว่า user มี role ที่ตรงกับ roles ที่กำหนดใน decorator หรือไม่
    const hasRequiredRole = requiredRoles.some((role) => user.role === role); //some() จะเช็คว่า user.role มีตรงกับ role ที่อนุญาตไว้หรือเปล่า
    //เช่น ถ้า requiredRoles = ['owner', 'employee'] แล้ว user เป็น employee → ผ่าน

    // ***** hasRequiredRole จะ return true/false และส่ง 403 มาเองเลย ถ้าอยากกำหนดเองก็กำหนด if แล้ว throw อย่างอื่นออกมา
    // if (!hasRequiredRole) {
    //   throw new ForbiddenException('You do not have the required role to access this resource');
    //   // หรือเปลี่ยนเป็น throw new UnauthorizedException(...) ได้เช่นกัน
    // }

    return hasRequiredRole;
  }
}
