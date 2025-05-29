import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateOrderProductDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsString()
  product_id: string;

  @IsNotEmpty()
  @IsNumber()
  total_price: number;

  @IsArray()
//   @IsUUID('all', { each: true }) // ตรวจสอบว่าเป็น UUID ทุกตัวใน array
  toppingIds: string[];
}
