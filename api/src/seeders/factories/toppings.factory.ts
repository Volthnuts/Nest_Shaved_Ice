import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { Topping } from "src/toppings/entities/topping.entity";

export const ToppingFactory = setSeederFactory(Topping, () => {
    const topping = new Topping();
    topping.name = faker.food.spice();
    topping.price = faker.number.float({ min: 1, max: 10, fractionDigits: 2 });
    topping.available = faker.datatype.boolean();

    return topping;
});