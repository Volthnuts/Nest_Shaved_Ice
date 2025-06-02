import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // ✅ ต้อง import

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist:true })); //ตัวนี้ มันจะตัดฟิลด์ที่ไม่อยู่ใน dto ออก
  //ถ้าเพิ่ม ,forbidNonWhitelisted: true จะเป็นการโยน error มาว่ามีฟิลด์แปลกๆ
  app.setGlobalPrefix('api/v1'); //กำหนด path หน้าทุก route

   // ✅ ดึง configService จาก DI container
  const configService = app.get(ConfigService);

  // ✅ Log ค่า DB config
  console.log('PG_HOST =', configService.get('PG_HOST'));
  console.log('Database config =', configService.get('database'));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
