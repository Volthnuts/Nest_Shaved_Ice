import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User } from 'src/users/entities/user.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderProduct } from 'src/order-products/entities/order-product.entity';
import { ProductImage } from 'src/product-images/entities/product-image.entity';
import { OrderStatus } from 'src/enum/order-enum';

export class MainSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager)
  : Promise<any> {
        const userFactory = factoryManager.get(User);
        const productFactory = factoryManager.get(Product);
        const toppingFactory = factoryManager.get(Topping);
        const orderFactory = factoryManager.get(Order);
        const orderProductFactory = factoryManager.get(OrderProduct);
        const productImageFactory = factoryManager.get(ProductImage);

// -----------------------------------------------------------------------------------------------------------

        const users = await userFactory.saveMany(10)
        // const products = await productFactory.saveMany(30)
        // const toppings = await toppingFactory.saveMany(100)

        // ✅ ป้องกันชื่อ Topping ซ้ำ
        const usedToppingNames = new Set<string>();
        const toppings = [] as Topping[];

        while (toppings.length < 100) {
            let name: string;
            do {
                name = faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial();
            } while (usedToppingNames.has(name));

            usedToppingNames.add(name);

            const topping = await toppingFactory.save({
                name,
                price: parseFloat(faker.commerce.price({ min: 0.5, max: 3 })),
                available: faker.datatype.boolean(),
            });

            toppings.push(topping);
        }


        // ✅ ป้องกันชื่อ Product ซ้ำ
        const usedProductNames = new Set<string>();
        const products = [] as Product[];

        while (products.length < 30) {
            let name: string;

            do {
                name = faker.commerce.productName();
            } while (usedProductNames.has(name));

            usedProductNames.add(name);

            const product = await productFactory.save({
                name,
                description: faker.commerce.productDescription(),
                price: parseFloat(faker.commerce.price({ min: 5, max: 20 })),
                available: faker.datatype.boolean(),
            });

            products.push(product);
        }

// -----------------------------------------------------------------------------------------------------------

        for (const product of products) {
            const randomToppings = faker.helpers.arrayElements(toppings, faker.number.int({ min: 3, max: 10 }));
            product.toppings = randomToppings;
            await dataSource.getRepository(Product).save(product);
        }

// -----------------------------------------------------------------------------------------------------------

        const orders: Order[] = [];
        for (const user of users) {
            const hasPending = faker.datatype.boolean(); // 50% ของ user จะมี pending

            // ถ้ามี pending = 1 รายการ
            if (hasPending) {
                const pendingOrder = await orderFactory.save({
                    user,
                    status: OrderStatus.PENDING,
                });
                orders.push(pendingOrder);
            }

            // สร้าง orders อื่นๆ แบบสุ่มจำนวน (0–3) และสุ่ม status ที่ไม่ใช่ PENDING
            const otherOrderCount = faker.number.int({ min: 0, max: 3 });
            for (let i = 0; i < otherOrderCount; i++) {
                const status = faker.helpers.arrayElement([
                    OrderStatus.PAID,
                    OrderStatus.DELIVERED,
                    OrderStatus.CANCELED,
                ]);

                const order = await orderFactory.save({
                    user,
                    status,
                });

                orders.push(order);
            }
        }

// -----------------------------------------------------------------------------------------------------------

        const productImages = await Promise.all(
            products.flatMap(async (product) => {
                const imageCount = faker.number.int({ min: 1, max: 5 });
                const images = await Promise.all(
                    Array.from({ length: imageCount }).map(async () => {
                        const image = await productImageFactory.make();
                        image.product = product;
                        return dataSource.getRepository(ProductImage).save(image);
                    })
                );

                return images;
            })
        );

// -----------------------------------------------------------------------------------------------------------

        for (const order of orders) {
        const orderProducts: OrderProduct[] = [];

        const numberOfOrderProducts = faker.number.int({ min: 1, max: 5 });

        for (let i = 0; i < numberOfOrderProducts; i++) {
            const product = faker.helpers.arrayElement(products);
            const quantity = faker.number.int({ min: 1, max: 3 });

            const availableToppings = toppings.filter(t => t.available);
            const selectedToppings = faker.helpers.arrayElements(availableToppings, faker.number.int({ min: 3, max: 5 }));

            const toppingPrice = selectedToppings.reduce((sum, t) => sum + Number(t.price), 0);
            const unit_price = Number(product.price) + toppingPrice;

            const orderProduct = await orderProductFactory.save({
                order,
                product,
                quantity,
                unit_price,
                orderProductToppings: selectedToppings,
            });

            orderProducts.push(orderProduct);
        }

        order.total_price = Number(
            orderProducts.reduce((sum, op) => {
                return sum + Number(op.unit_price) * op.quantity;
            }, 0).toFixed(2)
        );


        await dataSource.getRepository(Order).save(order);
        }
    }
}