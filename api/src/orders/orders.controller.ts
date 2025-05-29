import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwTAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth-guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from 'src/auth/enums/role.enum';
import { CreateOrderProductDto } from 'src/order-products/dto/create-order-product.dto';
import { UpdateOrderProductDto } from 'src/order-products/dto/update-order-product.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwTAuthGuard)
  @Post('addOrCreateOrder')
  addOrCreateOrder(@Request() req, @Body() createOrderProductDto: CreateOrderProductDto) {
    return this.ordersService.addOrCreateOrder(createOrderProductDto, req.user.id);
  }

  @UseGuards(JwTAuthGuard)
  @Get('getOrder')
  getOrder(@Request() req) {
    return this.ordersService.getOrder(req.user.id);
  }

  // @UseGuards(JwTAuthGuard)
  @Get('paidOrderOneUser')
  paidOrderOneUser(@Request() req) {
    return this.ordersService.getAllPaidOrderPriceFromOneUser(req.user.id);
  }

  // @UseGuards(JwTAuthGuard)
  // @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  @Get('paidOrderAllUser')
  paidOrderAllUser() {
    return this.ordersService.getAllPaidOrderPriceFromAllUser();
  }

  // @Get('paidOrderOneUser')
  // addOrCreateOrder(@Request() req) {
  //   return this.ordersService.addOrCreateOrder(req.user.id);
  // }

  @UseGuards(JwTAuthGuard)
  @Patch('updateProductInOrder')
  update(@Request() req, @Body() updateOrderProductDto: UpdateOrderProductDto) {
    return this.ordersService.update(req.user.id, updateOrderProductDto);
  }

  @UseGuards(JwTAuthGuard)
  @Delete('deleteProductInOrder/:productId')
  remove(@Param('productId') orderProductId: string) {
    return this.ordersService.remove(orderProductId);
  }

  @UseGuards(JwTAuthGuard)
  @Get('purchase')
  purchaseOrder(@Request() req) {
    return this.ordersService.complete(req.user.id);
  }
}
