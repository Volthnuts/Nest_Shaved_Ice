import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderProduct } from 'src/order-products/entities/order-product.entity';
import { Topping } from 'src/toppings/entities/topping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ Order, OrderProduct, Topping ])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
