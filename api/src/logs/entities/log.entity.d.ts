import { User } from "src/users/entities/user.entity";
export declare class Log {
    id: string;
    user: User;
    action: string;
    description: string;
    createdAt: Date;
}
