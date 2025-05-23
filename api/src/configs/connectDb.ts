import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { OrderProduct } from 'src/order-products/entities/order-product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { Product } from 'src/products/entities/product.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { User } from 'src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('PG_HOST'),
  port: config.get<number>('PG_PORT'),
  username: config.get<string>('PG_USER'),
  password: config.get<string>('PG_PASSWORD'),
  database: config.get<string>('PG_DATABASE'),
  entities: [User, Order, Product, ProductImage, Topping, OrderProduct],
  synchronize: true, // ❗ปิดใน production
});