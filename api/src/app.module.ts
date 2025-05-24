import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { OrderProduct } from './order-products/entities/order-product.entity';
import { User } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { ProductImage } from './product-images/entities/product-image.entity';
import { Product } from './products/entities/product.entity';
import { Topping } from './toppings/entities/topping.entity';
import { AuthModule } from './auth/auth.module';
import connectDb from './configs/connectDb';
import { UsersModule } from './users/users.module';
import { ToppingsModule } from './toppings/toppings.module';
import { ProductsModule } from './products/products.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { OrdersModule } from './orders/orders.module';
import { OrderProductsModule } from './order-products/order-products.module';

@Module({
  imports: [ UsersModule, ToppingsModule, ProductsModule, ProductImagesModule, OrdersModule, OrderProductsModule,
    // โหลด .env และตั้งให้ Config ใช้ได้ทั้งระบบ
    // ไม่ใช้ load:[connectDb] เพราะเราจะใช้ forFeature แทน (แบบ type-safe)
    ConfigModule.forRoot({
      isGlobal: false, //ถ้า global เป็น true, ทุก module ไม่ต้อง import [ ConfigModule.forFeature ] เพื่อให้อ่าน .env ได้แล้ว
      // ลองสลับ true/false แล้วไปลบ configModule ของ connectDb ก็ได้
      // load: [connectDb],

      //** ใน jwt ไม่ต้องใช้ feature ซึ่งต่างกับ TyprOrmModule เพราะ asProvider() จะลงทะเบียน config .env ให้ jwtConfig ใช้ได้ในไฟล์ของมันเองเลย
      //แต่ใส่ไว้ก็ดี เพราะตัวอื่นอาจไม่เหมือนกัน ทำให้ชินดีกว่า
    }),

    // ใช้ ConfigModule.forFeature(connectDb)
    // * ทำให้โมดูลนี้สามารถเรียกใช้ค่าจาก `connectDb.KEY` ได้แบบ type-safe
    // KEY คือชื่อที่ตั้งไว้ใน config ทั้ง connectDb, jwtConfig
    ConfigModule.forFeature(connectDb),

    // เชื่อมต่อฐานข้อมูลด้วย TypeORM โดยใช้ค่าจาก config (`connectDb`)
    // * ใช้ forRootAsync เพื่อ inject ConfigService มาดึงค่าจาก .env ผ่าน connectDb
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ต้อง import เพื่อเข้าถึงค่า config
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'), // หรือ connectDb.KEY ก็ได้
      }),
    }),
    AuthModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
