import getDataSourceOptions from '../configs/connectDb';  // default import
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { config as dotenvConfig } from 'dotenv';
import { MainSeeder } from './seeds';
import { OrderProductFactory } from './factories/order-products.factory';
import { OrderFactory } from './factories/orders.factory';
import { ProductImageFactory } from './factories/product-images.factory';
import { ProductFactory } from './factories/products.factory';
import { ToppingFactory } from './factories/toppings.factory';
import { UserFactory } from './factories/users.factory';

dotenvConfig({ path: '.env' });

console.log('Starting seeder...');

const dataSourceOptions: DataSourceOptions = getDataSourceOptions();
const dataSource = new DataSource(dataSourceOptions);

dataSource.initialize().then(async () => {
  console.log('Datasource initialized');
  // await dataSource.synchronize(true);
  // await dataSource.runMigrations();
  console.log('Migrations executed');
  console.log('Database synchronized');

  // runSeeders ต้องส่ง SeederOptions ที่แยกต่างหาก
  const seederOptions: SeederOptions = {
    seeds: [MainSeeder],
    factories: [OrderProductFactory, OrderFactory, ProductImageFactory, ProductFactory, ToppingFactory, UserFactory],
  };

  await runSeeders(dataSource, seederOptions);

  console.log('Seeders completed');
  process.exit();
}).catch((err) => {
  console.error('Seeder error:', err);
});
