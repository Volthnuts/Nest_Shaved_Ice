// src/configs/connectDb.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { OrderProduct } from 'src/order-products/entities/order-product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { Product } from 'src/products/entities/product.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { User } from 'src/users/entities/user.entity';
import { registerAs } from '@nestjs/config';
import { Log } from 'src/logs/entities/log.entity';

dotenvConfig({ path: '.env' });

export const getDataSourceOptions = (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT!, 10),
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    entities: [User, Order, Product, ProductImage, Topping, OrderProduct, Log],
    migrations: ['dist/migrations/*{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
  }
};

export default registerAs('database', () => getDataSourceOptions());
export const connectionSource = new DataSource(getDataSourceOptions());
