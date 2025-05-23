import { Entity,
        PrimaryGeneratedColumn,
        Column,
        CreateDateColumn,
        UpdateDateColumn,
        ManyToOne,
        JoinColumn, 
        OneToMany} 
        from "typeorm";

import { User } from "src/users/entities/user.entity";
import { table } from "src/configs/database_name";
import { OrderProduct } from "src/order-products/entities/order-product.entity";

export enum OrderStatus{
    PENDING = 'pending',
    PAID = 'paid',
    PREPARING = 'preparing',
    DELIVERED = 'delivered',
    CANCELED = 'canceled'
}

@Entity({ name: `${table.order}` })
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.orders, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    users: User;

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus

    @Column({ type: 'float',nullable: false })
    total_price: number

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => OrderProduct, orderProduct => orderProduct.order, { nullable: false })
    orderProducts: OrderProduct
}
