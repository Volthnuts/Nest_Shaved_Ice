import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

export const ROLES_KEY = 'roles'; // Key ที่ใช้เก็บ metadata บน route
// สร้าง custom decorator สำหรับกำหนด role ที่ route ต้องการ
// โดยตัวที่สร้างชื่อ Roles => เอาไปใช้ @Roles(UserRole.Userrole1) ไรงี้
export const Roles = (...roles: [UserRole, ...UserRole[]]) =>
  SetMetadata(ROLES_KEY, roles); // เก็บ role metadata ไว้ใน route handler

// MetaData คือ "ข้อมูลประกอบ" ที่เราแนบไว้กับ คลาส, เมธอด, หรือ property
// การ SetMetadata คือ set ให้ route นั้นต้องแนบบข้อมูลพิเศษเพิ่มไปด้วย โดยในที่นี้ใช้ key = roles => { roles: [ UserRole1,UserRole2,UserRole3 ] }
// เจ้านี่จะเอาไปใช้ใน role-guard