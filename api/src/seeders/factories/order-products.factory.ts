import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { OrderProduct } from "src/order-products/entities/order-product.entity";

export const OrderProductFactory = setSeederFactory(OrderProduct, () => {
    const orderProduct = new OrderProduct();
    return orderProduct;
});