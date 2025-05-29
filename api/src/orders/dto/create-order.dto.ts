import { IsDecimal, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { OrderStatus } from "src/auth/enums/role.enum";

export class CreateOrderDto {    
    @IsNotEmpty({ message: 'Status can not be null' })
    @IsEnum(OrderStatus, ({ message: 'Order status is invalid' }))
    status: OrderStatus

    @IsNotEmpty({ message:'TotalPrice can not be null' })
    @IsDecimal()
    total_price:number;

    @IsNotEmpty({ message:'UserId can not be null' })
    @IsString({ message: 'UserId must be string' })
    user_id:string;
    
}
