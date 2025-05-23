import { Entity,
        PrimaryGeneratedColumn,
        Column,
        CreateDateColumn,
        UpdateDateColumn,
        OneToMany,
        ManyToMany,
        JoinTable } 
        from "typeorm";

import { table } from "src/configs/database_name";
import { ProductImage } from "src/product-images/entities/product-image.entity";
import { Topping } from "src/toppings/entities/topping.entity";
import { OrderProduct } from "src/order-products/entities/order-product.entity";

@Entity({ name: `${ table.product }` })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    name: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price: number

    @Column({ type: 'boolean', default: true })
    available: boolean

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => ProductImage, productImage => productImage.image)
    images: ProductImage[];

    @ManyToMany(() => Topping, topping => topping.products)
    @JoinTable({
        name: `${ table.product_topping }`,
        joinColumn: { name: 'product_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'topping_id', referencedColumnName: 'id' }
    })
    toppings:[];

    @OneToMany(() => OrderProduct, orderProduct => orderProduct.product)
    orderProducts: OrderProduct
}
