import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderProductDto } from './create-order-product.dto';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateOrderProductDto extends PartialType(CreateOrderProductDto) { 
    // PartialType(CreateOrderProductDto) จะ ทำให้ทุกฟิลด์ใน CreateOrderProductDto 
    // กลายเป็น optional ทั้งหมด โดยอัตโนมัติ — ซึ่งเป็นพฤติกรรมปกติของ PartialType ที่มาจาก @nestjs/mapped-types
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    order_id: string;

    @IsNotEmpty()
    @IsNumber()
    total_price: number;

    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @IsArray()
    //   @IsUUID('all', { each: true }) // ตรวจสอบว่าเป็น UUID ทุกตัวใน array
    toppingIds: string[];
}
