import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { In, Not, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { table } from 'src/configs/database_name';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/auth/enums/role.enum';
import { OrderProduct } from 'src/order-products/entities/order-product.entity';
import { CreateOrderProductDto } from 'src/order-products/dto/create-order-product.dto';
import { Product } from 'src/products/entities/product.entity';
import { Topping } from 'src/toppings/entities/topping.entity';
import { User } from 'src/users/entities/user.entity';
import { UpdateOrderProductDto } from 'src/order-products/dto/update-order-product.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private orderProductRepository: Repository<OrderProduct>,
    @InjectRepository(Topping)
    private toppingRepository: Repository<Topping>
  ){}

  async addOrCreateOrder(createOrderProductDto: CreateOrderProductDto, userId: string) {
    // เช็คตาราง order ว่ามีตะกร้าที่ยังไม่จ่ายตังค์มั้ย ถ้ามีก็ใช้อันเดิม ถ้าไม่จะสร้างใหม่
    let orderExists = await this.orderRepository
                            .findOne({
                                where: {
                                  status: OrderStatus.PENDING,
                                  user: { id: userId }
                                },
                            });  
    if(!orderExists){
      const order = this.orderRepository.create({
        total_price: 0,   
        status: OrderStatus.PENDING,
        user: { id: userId }, 
      });
      orderExists = await this.orderRepository.save(order);
    }                        

    // ----------------------------------------------------------------------------------------------------------------------

    // เพิ่ม product_id กับ order_id ลงใน orderProduct เป็นการเพิ่มสินค้าลงตะกร้า
    // สร้าง instance ของ orderProduct จาก DTO
    const toppings = await this.toppingRepository.findBy({
      id: In(createOrderProductDto.toppingIds) // หา topping ทั้งหมดที่ถูกส่งมาใน array 
    });

    // 1. Find all OrderProduct of this order with the same product
    const existingOrderProduct = await this.orderProductRepository.find({
      where: {
        order: { id: orderExists.id },
        product: { id: createOrderProductDto.product_id },
      },
      relations: ['orderProductToppings'], // จำเป็นต้องดึง relations
    });
    // 2. เช็กว่า toppings เหมือนกันไหม
    let addedOrderProduct:any;
    let productTotal:any;
    const normalizeToppingIds = (toppings: Topping[]) =>
      toppings.map(t => t.id).sort().join(',');

    const incomingToppingIds = normalizeToppingIds(toppings);
    const matchedOrderProduct = existingOrderProduct.find(op => 
      normalizeToppingIds(op.orderProductToppings) === incomingToppingIds
    );

    if (matchedOrderProduct) {
      // 3. ถ้าเจออันที่ match → อัพเดต quantity + total_price
      matchedOrderProduct.quantity = Number(matchedOrderProduct.quantity) + Number(createOrderProductDto.quantity);
      addedOrderProduct = await this.orderProductRepository.save(matchedOrderProduct);
      productTotal = Number(addedOrderProduct.quantity) * Number(addedOrderProduct.unit_price);

    } else {
      const orderProduct = this.orderProductRepository.create({
        ...createOrderProductDto,
        unit_price: createOrderProductDto.total_price / createOrderProductDto.quantity,
        orderProductToppings: toppings, //สร้าง relation กับ topping ทีเดียวตอนสร้าง OrderProduct ไปเลย
        order: orderExists,
        product: { id: createOrderProductDto.product_id } as Product
      });

      // บันทึก
      addedOrderProduct = await this.orderProductRepository.save(orderProduct);
      productTotal = createOrderProductDto.total_price;
      // map ความสัมพันธ์
      // orderProduct.order เป็น relation กับ Entity Order (@ManyToOne(() => Order, ...))
      // ดังนั้นต้อง assign ทั้ง object ไม่ใช่แค่ order_id ตรง ๆ
      // เพราะ orderExists คือ object ของ Order ที่คุณได้จาก .findOne(...) มาก่อนแล้ว
      // TypeORM รู้ว่าใน field นี้จะต้องเก็บ Order object ไม่ใช่ UUID ธรรมดา
      //******* */ orderProduct.order = orderExists; // ไม่ใช่ order_id

      // เพราะคุณกำลังสร้าง partial object ของ Product
      // แต่ TypeScript ไม่รู้ว่ามันคือ Product → เลยต้อง cast ด้วย as Product
      // เพื่อให้ TypeORM มองว่ามันคือ object ที่สามารถใช้ใน relation ได้
      //******* */ orderProduct.product = { id: createOrderProductDto.product_id } as Product;
    }  

      // อัพเดตราคารวมของ order
      await this.orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ total_price: () => `"total_price" + ${productTotal}` })
        .where("id = :id", { id: orderExists.id })
        .execute(); // สั่งให้รันคำสั่งนี้กับฐานข้อมูล
      // .execute() ใช้กับ คำสั่ง SQL ที่เปลี่ยนแปลงข้อมูล เช่น INSERT, UPDATE, DELETE
      // แต่ การดึงข้อมูล (SELECT) ผ่าน QueryBuilder ใน TypeORM จะใช้ .getRawMany(), .getMany(), .getOne() แทน
    
    // ----------------------------------------------------------------------------------------------------------------------
  }

  async getOrder(userId: string) {
    const order = await this.orderRepository.query( //.query จะ return เป็น array เสมอ
      `
        SELECT
          o.id,
          o.total_price,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'order_product_id', op.id,
              'product_id', p.id,
              'product_name', p.name,
              'unit_price', op.unit_price,
              'quantity', op.quantity,
              'note', op.note,
              'images', (
                  SELECT JSON_AGG(pi.image_name)
                  FROM ${table.product_image} pi
                  WHERE pi.product_id = p.id
              ),
              'toppings', (
                  SELECT JSON_AGG(JSON_BUILD_OBJECT(
                      'id', t.id, 
                      'name', t.name, 
                      'price', t.price,
                      'status', CASE 
                          WHEN opt.order_product_id IS NOT NULL THEN true 
                          ELSE false 
                      END))
                  FROM ${table.product_topping} pt 
                  LEFT JOIN ${table.topping} t 
                      ON pt.topping_id = t.id
                  LEFT JOIN ${table.order_product_topping} opt
                      ON opt.topping_id = t.id 
                      AND opt.order_product_id = op.id
                  WHERE pt.product_id = p.id
              )
            )
          ) AS products
          FROM ${table.order} o
          LEFT JOIN ${table.order_product} op
          ON o.id = op.order_id
          LEFT JOIN ${table.product} p 
          ON op.product_id = p.id
          WHERE o.status = 'pending' AND o.user_id = $1
          GROUP BY o.id
          ORDER BY o.created_at DESC
      `,[userId]
    )
    return order[0];
  }

  async getAllPaidOrderPriceFromOneUser(userId: string) {
    const paidOrderOneUserPrice = await this.orderRepository.query(
      `
        SELECT 
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'order_id', o.id,
              'total_price', o.total_price
            )
          ) AS paid_orders,
          SUM(o.total_price) AS total_paid,
          COUNT(*) AS total_order
        FROM orders o
        WHERE o.status = 'paid' AND o.user_id = $1
      `,[userId]
    );

    return paidOrderOneUserPrice[0];
  }

  async getAllPaidOrderPriceFromAllUser() {
    const paidOrderAllUserPrice = await this.orderRepository.query(
      `
        SELECT 
          user_id, 
          SUM(total_price) AS total_spent,
          COUNT(*) AS total_orders
        FROM orders
        WHERE status = 'paid'
        GROUP BY user_id;
      `,
    );

    return paidOrderAllUserPrice;
  }

  async update(userId: string, updateOrderProductDto: UpdateOrderProductDto) {
    const isOwnerOfOrder = await this.orderRepository.findOne({
      where: {
        id: updateOrderProductDto.order_id,
        user: { id: userId },
        status: OrderStatus.PENDING
      }
    })
    if(!isOwnerOfOrder) throw new UnauthorizedException('This is not your order');

    const existingOrderProduct = await this.orderProductRepository.findOne({
      where: {
        id: updateOrderProductDto.id,
      },
      relations: ['orderProductToppings','product','order'],
    });
    if(!existingOrderProduct) throw new NotFoundException('OrderProduct not found');
    const oldTotalPrice = Number(existingOrderProduct.quantity) * Number(existingOrderProduct.unit_price);

    // 1. ลบ relation เดิมออก
    existingOrderProduct.orderProductToppings = []; // ตัดความสัมพันธ์ทั้งหมดออก
    await this.orderProductRepository.save(existingOrderProduct); // เซฟเพื่อให้ลบใน DB จริง ๆ

    // 2. ดึง toppings ใหม่ตาม id ที่ส่งมา
    // if (updateOrderProductDto.toppingIds) {
    const newToppings = await this.toppingRepository.findBy({
      id: In(updateOrderProductDto.toppingIds),
    });
    existingOrderProduct.orderProductToppings = newToppings;

    const anotherSameProduct = await this.orderProductRepository.find({
      where: {
        id: Not(existingOrderProduct.id),
        order: { id: existingOrderProduct.order.id},
        product: { id: existingOrderProduct.product.id },
      },
      relations: ['orderProductToppings'], // จำเป็นต้องดึง relations
    });

    if (anotherSameProduct.length > 0) {
      const normalizeToppingIds = (toppings: Topping[]) =>
        toppings.map(t => t.id).sort().join(',');

      const incomingToppingIds = normalizeToppingIds(existingOrderProduct.orderProductToppings);
      const matchedOrderProduct = anotherSameProduct.find(op =>
        normalizeToppingIds(op.orderProductToppings) === incomingToppingIds
      );

      if (matchedOrderProduct) {
        // ลบ existing ตัวเดิม
        await this.orderProductRepository.remove(existingOrderProduct);
        // รวม quantity แล้วเซฟกลับ
        matchedOrderProduct.quantity = Number(matchedOrderProduct.quantity) + Number(updateOrderProductDto.quantity);
        await this.orderProductRepository.save(matchedOrderProduct);

        await this.orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ total_price: () => `"total_price" + ${updateOrderProductDto.quantity * matchedOrderProduct.unit_price} - ${oldTotalPrice}` })
        .where("id = :id", { id: updateOrderProductDto.order_id })
        .execute()

        return matchedOrderProduct;

      } else {
        // ✅ fallback ถ้าไม่ match
        await this.orderProductRepository.save(existingOrderProduct);

        if (updateOrderProductDto.quantity) {
          existingOrderProduct.quantity = updateOrderProductDto.quantity;
        }
        if (updateOrderProductDto.total_price) {
          existingOrderProduct.unit_price = updateOrderProductDto.total_price / updateOrderProductDto.quantity;
        }

        await this.orderRepository
          .createQueryBuilder()
          .update(Order)
          .set({ total_price: () => `"total_price" + ${existingOrderProduct.quantity * existingOrderProduct.unit_price} - ${oldTotalPrice}` })
          .where("id = :id", { id: updateOrderProductDto.order_id })
          .execute();

        return await this.orderProductRepository.save(existingOrderProduct);
      }
    } else {
       // 3. เซฟความสัมพันธ์ใหม่
      const newOrder = await this.orderProductRepository.save(existingOrderProduct);
  
      // 4. อัพเดต field อื่น ๆ ด้วยถ้ามี
      if (updateOrderProductDto.quantity) {
        existingOrderProduct.quantity = updateOrderProductDto.quantity;
      }
      if (updateOrderProductDto.total_price) {
        existingOrderProduct.unit_price = updateOrderProductDto.total_price / updateOrderProductDto.quantity;
      }

      await this.orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ total_price: () => `"total_price" + ${existingOrderProduct.quantity * existingOrderProduct.unit_price} - ${oldTotalPrice}` })
        .where("id = :id", { id: updateOrderProductDto.order_id })
        .execute();

      return newOrder
    }
  }

  async remove(orderProductId: string) {
    const existingOrderProduct = await this.orderProductRepository.findOne({
      where: {
        id: orderProductId,
      },
      relations: ['orderProductToppings','product','order'],
    });
    if(!existingOrderProduct) throw new NotFoundException('OrderProduct not found');

    await this.orderProductRepository.remove(existingOrderProduct)

    const newOrder = await this.orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ total_price: () => `"total_price" - (${existingOrderProduct.quantity * existingOrderProduct.unit_price})` })
        .where("id = :id", { id: existingOrderProduct.order.id })
        .execute()

    return newOrder
  }

  async complete(userId: string) {
    return await this.orderRepository.update({
        user: { id: userId },
        status: OrderStatus.PENDING
      },
      {
        status: OrderStatus.PAID
      }
    );
  }
}
