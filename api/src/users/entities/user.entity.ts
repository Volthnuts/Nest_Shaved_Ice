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
import { Log } from "src/logs/entities/log.entity";

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

    // ปกติ TypeORM จะตั้งชื่อ enum เป็น ${tableName}_${columnName}_enum แต่การระบุ enumName ให้ชัดเจนจะช่วยให้ migration ถูกสร้างถูกต้องเสมอ
    @Column({
        type: 'enum',
        enum: UserRole,
        enumName: 'users_role_enum',      // ชื่อ ENUM ใน PostgreSQL
        default: UserRole.CUSTOMER
    })
    role: UserRole

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Order, order => order.user)
    orders: Order[];

    @OneToMany(() => Log, log => log.user)
    logs: Log[];

    @Column({ type: 'varchar', length: 255,nullable: true })
    hashedRefreshToken: string | null;
}