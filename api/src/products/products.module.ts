import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderProduct } from 'src/order-products/entities/order-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ Product, Order, OrderProduct ])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
