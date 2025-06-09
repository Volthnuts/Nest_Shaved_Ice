import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Order } from "src/orders/entities/order.entity";
import { OrderStatus } from "src/enum/order-enum";

export const OrderFactory = setSeederFactory(Order, () => {
    const order = new Order();
    order.status = faker.helpers.arrayElement(Object.values(OrderStatus));
    order.total_price = 0;

    return order;
});