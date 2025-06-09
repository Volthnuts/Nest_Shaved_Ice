import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Product } from './../../products/entities/product.entity';

export const ProductFactory = setSeederFactory(Product, () => {
    const product = new Product();
    product.name = faker.food.dish();
    product.description = faker.food.description();
    product.price = faker.number.float({ min: 5, max: 20, fractionDigits: 2 })
    product.available = faker.datatype.boolean();

    return product;
});