import { Order } from "src/orders/entities/order.entity";
import { Product } from "src/products/entities/product.entity";
import { Entity, 
        JoinColumn, 
        ManyToOne, 
        PrimaryGeneratedColumn, 
        Column, 
        UpdateDateColumn, 
        CreateDateColumn,
        JoinTable,
        ManyToMany} from "typeorm";

import { table } from "src/configs/database_name";
import { Topping } from "src/toppings/entities/topping.entity";

@Entity({ name: `${ table.order_product }` })
export class OrderProduct {
    @PrimaryGeneratedColumn('uuid')
    id:string

    @ManyToOne(() => Order, order => order.orderProducts,{ nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order

    @ManyToOne(() => Product, product => product.orderProducts,{ nullable: false })
    @JoinColumn({ name: 'product_id' })
    product: Product

    @Column({ type: 'numeric' })
    quantity: number;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    unit_price: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    note?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToMany(() => Topping, topping => topping.orderProductToppings)
    @JoinTable({
        name: `${ table.order_product_topping }`,
        joinColumn: { name: 'order_product_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'topping_id', referencedColumnName: 'id' }
    })
    orderProductToppings: Topping[];
}

