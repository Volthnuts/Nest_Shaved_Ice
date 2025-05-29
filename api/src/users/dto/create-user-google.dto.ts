import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// src/auth/dto/create-google-user.dto.ts
export class CreateGoogleUserDto {
    @IsNotEmpty({ message: 'Name can not be null' })
    @IsString({ message: 'Name must be string' })
    name: string

    @IsNotEmpty({ message:'Email can not be null' })
    @IsEmail({},{ message:'Please provide a valid email' })
    email:string;

    @IsNotEmpty({ message:'Password can not be null' })
    @IsString({ message: 'Password must be string' })
    password:string;
  
}
