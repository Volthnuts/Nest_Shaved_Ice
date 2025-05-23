import { Entity,
        PrimaryGeneratedColumn,
        Column,
        CreateDateColumn,
        UpdateDateColumn,
        ManyToMany } 
        from "typeorm";

import { table } from "src/configs/database_name";
import { Product } from "src/products/entities/product.entity";
import { OrderProduct } from "src/order-products/entities/order-product.entity";

@Entity({ name: `${ table.topping }` })
export class Topping {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    name: string

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price: number

    @Column({ type: 'boolean', default: true })
    available: boolean

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;

    @ManyToMany(() => Product, product => product.toppings)
    products:[];

    @ManyToMany(() => OrderProduct, orderProduct => orderProduct.orderProductToppings)
    orderProductToppings:[];
}
