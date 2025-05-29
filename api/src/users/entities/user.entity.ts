import { Entity,
        PrimaryGeneratedColumn,
        Column,
        CreateDateColumn,
        UpdateDateColumn,
        OneToMany } 
        from "typeorm";

import { Order } from "src/orders/entities/order.entity";
import { table } from "src/configs/database_name";
import { UserRole } from "src/auth/enums/role.enum";

@Entity({ name: `${table.user}` })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    email: string;

    @Column({ length: 255, nullable: false })
    password: string;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    address: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
    role: UserRole

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Order, order => order.user)
    orders: Order[];

    @Column({ type: 'varchar', length: 255,nullable: true })
    hashedRefreshToken: string | null;
}