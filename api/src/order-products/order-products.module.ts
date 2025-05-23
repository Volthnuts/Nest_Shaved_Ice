import { Module } from '@nestjs/common';
import { OrderProductsService } from './order-products.service';
import { OrderProductsController } from './order-products.controller';

@Module({
  controllers: [OrderProductsController],
  providers: [OrderProductsService],
})
export class OrderProductsModule {}
