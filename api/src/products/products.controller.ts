import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('get_all')
  findAll() {
    return this.productsService.findAll();
  }

  @Get('get_one')
  findOne(@Query('productId') productId: string) {
    return this.productsService.findOne(productId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete('deleteProduct/:productId')
  remove(@Param('productId') productId: string) {
    return this.productsService.remove(productId);
  }
}
