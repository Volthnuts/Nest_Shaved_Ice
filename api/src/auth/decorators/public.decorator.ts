import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'IS_PUBLIC';
// สร้าง decorator สำหรับ mark route ให้ "public" (ไม่ต้อง login)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
