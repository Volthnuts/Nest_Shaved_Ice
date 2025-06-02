import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { table } from "src/configs/database_name";
import { Order } from 'src/orders/entities/order.entity';
import { OrderProduct } from 'src/order-products/entities/order-product.entity';
import { OrderStatus } from 'src/auth/enums/role.enum';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private orderProductRepository: Repository<OrderProduct>,
  ){}

  async create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  async findAll() {
    const product = await this.productRepository
        .createQueryBuilder('p')
        // .leftJoin('p.images', 'pi') // ถ้าใน entity `Product` มี relation images
        .leftJoin(table.product_image, 'pi', 'pi.product_id = p.id')
        .select([
          'p.id',
          'p.name',
          'p.description',
          'p.price',
          'p.createdAt',
          'JSON_AGG(pi.image_name) AS images'
        ])
        .where('p.available = :available', { available: true })
        .groupBy('p.id')
        .orderBy('p.createdAt', 'DESC')
        .getRawMany()

    return {
      status: 'success',
      data: product.map((p) => ({
          id: p.p_id,
          name: p.p_name,
          description: p.p_description,
          price: p.p_price,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
      })),
    }
  }

  async findOne(productId: string) {
    const product = await this.productRepository
      .createQueryBuilder('p')
      .select([
        'p.id',
        'p.name',
        'p.description',
        'p.price',
      ])
      // Subquery ดึง image_names
      .addSelect(subQuery => {
        return subQuery
          .select('JSON_AGG(pi.image_name)')
          .from(table.product_image, 'pi')
          .where('pi.product_id = p.id');
      }, 'image_names')
      // Subquery ดึง toppings (array of objects)
      .addSelect(subQuery => {
        return subQuery
          .select(`JSON_AGG(JSON_BUILD_OBJECT('id', t.id, 'name', t.name, 'price', t.price))`)
          .from(table.product_topping, 'pt')
          .leftJoin(table.topping, 't', 'pt.topping_id = t.id')
          .where('pt.product_id = p.id');
      }, 'toppings')
      .where('p.id = :productId', { productId })
      .getRawOne();

    return {
      status: 'success',
      data: {
        id: product.p_id,
        name: product.p_name,
        description: product.p_description,
        price: product.p_price,
        image_names: typeof product.image_names === 'string' ? JSON.parse(product.image_names) : product.image_names,
        toppings: typeof product.toppings === 'string' ? JSON.parse(product.toppings) : product.toppings,
      },
    };
}

  async update(productId: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${productId} product`;
  }

  async remove(productId: string) {
    //หา product ที่ต้องการลบที่อยู่ในตะกร้าที่ยัง pending อยู่ เป็น array หลายๆตะกร้า
    const deleteProductFromPendingOrder = await this.orderProductRepository.find({
      where: {
        product: { id: productId },
        order: { status: OrderStatus.PENDING },
      },
      relations: ['order', 'orderProductToppings'],
    })
    if (!deleteProductFromPendingOrder.length) return

    // สร้างแผนที่ (Map) เพื่อเก็บยอดเงินที่ต้องลบออกจากแต่ละ Order (ตาม orderId)
    const priceOfDeletedProduct = new Map<string, number>();

    for (const op of deleteProductFromPendingOrder) {
      // คำนวณราคารวมของสินค้านี้ (quantity * unit_price)
      const totalToSubtract = Number(op.quantity) * Number(op.unit_price);
      const orderId = op.order.id; //เอา id ของ order มาจากแต่ละ orderProduct ที่สินค้านี้อยู่

      // ลบราคานี้ออกจากยอดรวม (ใช้การบวกกับค่าลบทีหลัง)
      priceOfDeletedProduct.set(
        orderId,
        (priceOfDeletedProduct.get(orderId) ?? 0) - totalToSubtract
      );
    }

    // // อัปเดตราคา total_price ของแต่ละ Order โดยลบราคาสินค้าที่ถูกลบออก
    // for (const [orderId, priceToSubtract] of priceOfDeletedProduct.entries()) {
    //   const order = await this.orderRepository.findOne({ where: { id: orderId } });
    //   if (!order) continue;

    //   // เพิ่มค่าลบเข้าไป (เท่ากับลดราคาลง)
    //   const newTotal = Number(order.total_price) + priceToSubtract;
    //   await this.orderRepository.update(orderId, { total_price: newTotal });
    // }

    // // ลบ OrderProduct (จะลบ relation ใน JoinTable ด้วย)
    // // orderProductRepository ซึ่งจะลบทุกความสัมพันธ์ที่ผูกกับ OrderProduct โดยอัตโนมัติ ถ้าคุณได้ตั้งค่า cascade ไว้ถูกต้อง — 
    // // และในกรณีของ @ManyToMany ที่ใช้ @JoinTable() TypeORM จะจัดการลบจากตารางกลาง (order_product_topping) ให้อัตโนมัติ เมื่อคุณใช้ remove() กับ OrderProduct
    // await this.orderProductRepository.remove(deleteProductFromPendingOrder)

    return Object.fromEntries(priceOfDeletedProduct)
  }
}