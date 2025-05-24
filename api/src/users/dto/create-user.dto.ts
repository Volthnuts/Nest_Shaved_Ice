import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Name can not be null' })
    @IsString({ message: 'Name must be string' })
    name: string

    @IsNotEmpty({ message:'Email can not be null' })
    @IsEmail({},{ message:'Please provide a valid email' })
    email:string;

    @IsNotEmpty({ message:'Password can not be null' })
    @MinLength(4,{ message:'Password minimum charactor should be 4' })
    @IsString({ message: 'Password must be string' })
    // @Matches(/^(?=.*[A-Z])(?=.*\d).{4,}$/, { message: 'Password must have at least 1 uppercase letter and 1 number' })
    password:string;

    @IsNotEmpty({ message:'Phone can not be null' })
    @IsString({ message: 'Phone must be string' })
    phone:string;

    @IsNotEmpty({ message:'Address can not be null' })
    @IsString({ message: 'Address must be string' })
    address:string;
}
