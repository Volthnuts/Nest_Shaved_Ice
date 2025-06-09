import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { In, Not, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { table } from 'src/configs/database_name';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/enum/order-enum';
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

  async addOrCreateOrder(createOrderProductDto: CreateOrderProductDto, userId: string) { //เพิ่มสินค้าในตะกร้า หรือสร้างตะกร้าใหม่ถ้าพึ่งจ่ายตังค์ไปแล้ว order ยังไม่มี
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

  //อันนี้ใช้ raw sql เพราะมันค่อนข้างเป็นการ query ที่ซับซ้อน
  async getOrder(userId: string) { //ดูตะกร้าตัวเองว่ามีอะไรบ้าง มีแปะสร้างตะกร้าไว้ด้วย เผื่อไม่มี ไม่ใส่ก็ได้ แต่มันจะส่งว่างเปล่ามา
    // let orderExists = await this.orderRepository
    //                         .findOne({
    //                             where: {
    //                               status: OrderStatus.PENDING,
    //                               user: { id: userId }
    //                             },
    //                         });  
    // if(!orderExists){
    //   const order = this.orderRepository.create({
    //     total_price: 0,   
    //     status: OrderStatus.PENDING,
    //     user: { id: userId }, 
    //   });
    //   orderExists = await this.orderRepository.save(order);
    // }                        

    const order = await this.orderRepository.query( //.query จะ return เป็น array เสมอ
      `
        SELECT 
        -- ****o คือ alias ของ order****
        -- ****เอาแค่ id กับ ราคารวมของ order นั้นๆมา****
          o.id,
          o.total_price,

          -- ****รวมข้อมูลของแต่ละ order_products เข้าเป็น JSON****
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'order_product_id', op.id,
              'product_id', p.id,
              'product_name', p.name,
              'unit_price', op.unit_price,
              'quantity', op.quantity,
              'note', op.note,
              -- ****ดึงรูปทั้งหมดของสินค้าแต่ละตัว****
              'images', (
                  SELECT JSON_AGG(pi.image_name)
                  FROM ${table.product_image} pi
                  WHERE pi.product_id = p.id
              ),
              -- ****ดึง topping ทั้งหมดของสินค้านั้น ๆ พร้อมสถานะว่า user เลือกไหม****
              'toppings', (
                  SELECT JSON_AGG(JSON_BUILD_OBJECT(
                      'id', t.id, 
                      'name', t.name, 
                      'price', t.price,
                      'status', CASE 
                          WHEN opt.order_product_id IS NOT NULL THEN true 
                          ELSE false 
                      END)) -- ****ตรงนี้เป็นเงื่อนไขน่ะ ต้องดูผลลัพธ์ตอน leftjoin ถ้าเป็น null ให้ส่งฟิลด์ status : false หรือถ้าไม่ null ก็ส่ง true****
                            -- ****ลองนึกภาพ จากตาราง product_topping ที่เก็บ product.id กับ topping.id ไว้****
                            -- ****เราเอา topping มา join, ก็จะได้ว่า product_topping แต่ละแถวมีข้อมูลของ topping ว่าคืออะไรบ้าง****
                  FROM ${table.product_topping} pt 
                  LEFT JOIN ${table.topping} t 
                      ON pt.topping_id = t.id
                  LEFT JOIN ${table.order_product_topping} opt  -- ****order_product_topping ที่เก็บ order_product.id กับ topping.id ไว้: ลูกค้าเลือก topping อะไรบ้างใน product ที่อยู่ใน order นั้น****
                      ON opt.topping_id = t.id                  -- ****เรา join ตรงนี้ เพื่อจับคู่ topping****
                      AND opt.order_product_id = op.id          -- ****ต้อง AND ตรงนี้ ให้รู้ว่า เราสนใจเฉพาะ topping ของ order_product ตัวตัวเดียวกัน****
                  WHERE pt.product_id = p.id                    -- ****เฉพาะ topping ที่ถูก assign ให้กับ product นี้****
              )
            )
          ) AS products -- ****ตรงเนี้ย จะงงๆหน่อย มันเป็นการเอาข้อมูล product ไป join เป็น subquery เพื่อหา รูปกับ topping ที่มันมี****
                        -- ****แนะนำให้เชื่อมตารางหลักก่อน คือเอามาจาก order, แล้ว leftjoin กับ order_product แล้วเอา order_product ไป leftjoin กับ product****
                        -- ****พอเชื่อม product แล้ว ค่อยไป subquery ทีหลังว่าจะ join product กับอะไรบ้าง****

          -- ****ดึงข้อมูลจาก orders****
          FROM ${table.order} o

          -- ****เชื่อมกับ order_products****
          LEFT JOIN ${table.order_product} op
          ON o.id = op.order_id

          -- ****เชื่อมกับ products เพื่อดึงข้อมูลสินค้า****
          LEFT JOIN ${table.product} p 
          ON op.product_id = p.id

          -- ****เงื่อนไข: ต้องเป็น order ที่ยัง pending และเป็นของ user ที่กำหนด****
          WHERE o.status = 'pending' AND o.user_id = $1

          GROUP BY o.id
          ORDER BY o.created_at DESC
      `,[userId]
    )
    return order[0];
  }

  async getAllPaidOrderPriceFromOneUser(userId: string) { //ดูค่าใช้จ่ายทั้งหมดของ user คนหนึ่งว่า paid หรือจ่ายตังค์ไปเท่าไหร่แล้ว และสั่งไปกี่ order
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

  async getAllPaidOrderPriceFromAllUser() { //ดูค่าใช้จ่ายทั้งหมดของ user ทุกคนว่า paid หรือจ่ายตังค์ไปเท่าไหร่แล้ว และสั่งไปกี่ order, เดี๋ยว join แล้วดึงข้อมูล user มาโชว์ด้วยก็ดี
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

  async update(userId: string, updateOrderProductDto: UpdateOrderProductDto) { //แก้ไขสินค้าในตะกร้า เช่น เปลี่ยน topping หรือจำนวน
    // เช็คว่านี่เป็น order ของเราหรือไม่
    const isOwnerOfOrder = await this.orderRepository.findOne({
      where: {
        id: updateOrderProductDto.order_id,
        user: { id: userId },
        status: OrderStatus.PENDING
      }
    })
    if(!isOwnerOfOrder) throw new UnauthorizedException('This is not your order');

    // หา Product ที่อยู่ใน order เราจากตาราง OrderProduct ว่ามีหรือไม่จาก id ที่ส่งมา
    const existingOrderProduct = await this.orderProductRepository.findOne({
      where: {
        id: updateOrderProductDto.id,
      },
      relations: ['orderProductToppings','product','order'],
    });
    if(!existingOrderProduct) throw new NotFoundException('OrderProduct not found');

    // เก็บราคารวมของ product นั้นเอาไว้ก่อน เอาไว้อัพเดตใน order ทีหลัง
    const oldTotalPrice = Number(existingOrderProduct.quantity) * Number(existingOrderProduct.unit_price);

    // ลบ relation เดิมออก
    existingOrderProduct.orderProductToppings = []; // ตัดความสัมพันธ์ทั้งหมดออก
    await this.orderProductRepository.save(existingOrderProduct); // เซฟเพื่อให้ลบใน DB จริง ๆ

    // ดึง toppings ใหม่ตาม id ที่ส่งมา
    const newToppings = await this.toppingRepository.findBy({
      id: In(updateOrderProductDto.toppingIds), //เอา array ที่เก็บ id ของ topping ไปหาในตาราง toppings
    });
    existingOrderProduct.orderProductToppings = newToppings; //เติม topping ใหม่ลงไป

    // หาว่ามี product เดียวกันและอยู่ใน order เดียวกันอยู่มั้ย ที่ไม่ใช่ตัวเอง เพื่อเอาไปใช้ในกรณีเปลี่ยน topping แล้วเหมือนกัน
    const anotherSameProduct = await this.orderProductRepository.find({
      where: {
        id: Not(existingOrderProduct.id),
        order: { id: existingOrderProduct.order.id},
        product: { id: existingOrderProduct.product.id },
      },
      relations: ['orderProductToppings'], // จำเป็นต้องดึง relations
    });

    // มี product เดียวกันใน order เดียวกัน
    if (anotherSameProduct.length > 0) {
      // เอา array มา sorting ตาม id และรวมเป็น string เดียวด้วย join เพื่อเอาไปเทียบว่าเหมือนกันมั้ย
      const normalizeToppingIds = (toppings: Topping[]) =>
        toppings.map(t => t.id).sort().join(',');

      // เอา topping ใหม่ที่พึ่งใส่ลงไปใน existingOrderProduct.orderProductToppings มาเข้าฟังก์ชัน
      const incomingToppingIds = normalizeToppingIds(existingOrderProduct.orderProductToppings);

      // เอา anotherSameProduct ไปเทียบดูว่า string ที่ join แล้วตรงกันหรือไม่
      // ถ้าตรง ก็จะ return object anotherSameProduct ออกมา ถ้าไม่จะ undefied
      const matchedOrderProduct = anotherSameProduct.find(op =>
        normalizeToppingIds(op.orderProductToppings) === incomingToppingIds
      );

      //ถ้าเกิดมีค่า
      if (matchedOrderProduct) {
        // ลบ existing ตัวเดิม
        await this.orderProductRepository.remove(existingOrderProduct);
        // รวม quantity กับตัวที่หาเจอแล้วบันทึก
        matchedOrderProduct.quantity = Number(matchedOrderProduct.quantity) + Number(updateOrderProductDto.quantity);
        await this.orderProductRepository.save(matchedOrderProduct);

        // อัพเดตราคารวมใน order
        await this.orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ total_price: () => `"total_price" + ${updateOrderProductDto.quantity * matchedOrderProduct.unit_price} - ${oldTotalPrice}` })
        .where("id = :id", { id: updateOrderProductDto.order_id })
        .execute()

        return matchedOrderProduct;

        //ถ้าไม่มีค่าหรือ undefied
      } else {
        // จะ บันทึก product นี้ลงไปเลย
        const newOrder = await this.orderProductRepository.save(existingOrderProduct);

        // กำหนดค่า quantity กับ unit_price ตาม require ใน dto
        existingOrderProduct.quantity = updateOrderProductDto.quantity;
        existingOrderProduct.unit_price = updateOrderProductDto.total_price / updateOrderProductDto.quantity;

        // อัพเดตราคารวมใน order
        await this.orderRepository
          .createQueryBuilder()
          .update(Order)
          .set({ total_price: () => `"total_price" + ${existingOrderProduct.quantity * existingOrderProduct.unit_price} - ${oldTotalPrice}` })
          .where("id = :id", { id: updateOrderProductDto.order_id })
          .execute();

        
        return newOrder;
      }
    // ไม่เจอ product เดียวกันใน order นี้แล้ว มีตัวคนอย่างเดียว
    //***** เหมิอนกรณีที่ topping ไม่เหมือนกันเลย คือบันทึกเป็นอันใหม่ */
    } else { 
      // จะ บันทึก product นี้ลงไปเลย
      const newOrder = await this.orderProductRepository.save(existingOrderProduct);
  
      // กำหนดค่า quantity กับ unit_price ตาม require ใน dto
      existingOrderProduct.quantity = updateOrderProductDto.quantity;
      existingOrderProduct.unit_price = updateOrderProductDto.total_price / updateOrderProductDto.quantity;

      // อัพเดตราคารวมใน order
      await this.orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ total_price: () => `"total_price" + ${existingOrderProduct.quantity * existingOrderProduct.unit_price} - ${oldTotalPrice}` })
        .where("id = :id", { id: updateOrderProductDto.order_id })
        .execute();

      return newOrder
    }
  }

  async remove(orderProductId: string) { //ลบสินค้าในตะกร้า
    // หาว่ามี orderProduct นี้รึเปล่า
    const existingOrderProduct = await this.orderProductRepository.findOne({
      where: {
        id: orderProductId,
      },
      relations: ['orderProductToppings','product','order'],
    });
    if(!existingOrderProduct) throw new NotFoundException('OrderProduct not found');

    // ถ้ามีก็ลบทิ้งเลย ง่ายๆ
    await this.orderProductRepository.remove(existingOrderProduct)

    // อัพเดตราคาใน order
    const newOrder = await this.orderRepository
        .createQueryBuilder()
        .update(Order)
        .set({ total_price: () => `"total_price" - (${existingOrderProduct.quantity * existingOrderProduct.unit_price})` })
        .where("id = :id", { id: existingOrderProduct.order.id })
        .execute()

    return newOrder
  }

  async complete(userId: string) { //จ่ายตังค์ ปิด order
    //เปลี่ยนสถานะ order เฉยๆว่าจ่ายเงินแล้ว ถ้าซื้อของอีก ก็สร้าง order ใหม่
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
