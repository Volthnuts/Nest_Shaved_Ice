import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/connectDb';
import { OrderProduct } from './order-products/entities/order-product.entity';
import { User } from './users/entities/user.entity';
import { Order } from './orders/entities/order.entity';
import { ProductImage } from './product-images/entities/product-image.entity';
import { Product } from './products/entities/product.entity';
import { Topping } from './toppings/entities/topping.entity';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true ,
      envFilePath: path.resolve(__dirname, '../.env'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    TypeOrmModule.forFeature([OrderProduct, User, Order, ProductImage, Product, Topping]),
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
