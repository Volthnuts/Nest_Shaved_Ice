import { faker } from "@faker-js/faker";
import { setSeederFactory } from "typeorm-extension";
import { User } from "src/users/entities/user.entity";
import { UserRole } from 'src/auth/enums/role.enum';

export const UserFactory = setSeederFactory(User, () => {
    const user = new User();
    user.name = faker.person.fullName();
    user.email = faker.internet.email();
    user.password = "$2a$10$lqdZJ/SsXirw90Cun/NP0eXjXz1W5A8T4yZYL0JKgH15sFCdxANGS";
    user.phone = faker.phone.number();
    user.address = faker.location.streetAddress();
    user.role = faker.helpers.arrayElement(Object.values(UserRole));
    user.hashedRefreshToken = null;

    return user;
});