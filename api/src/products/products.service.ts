import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { table } from "src/configs/database_name";

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ){}

  create(createProductDto: CreateProductDto) {
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


  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
