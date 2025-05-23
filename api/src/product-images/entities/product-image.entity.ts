import { Entity,
        PrimaryGeneratedColumn,
        Column,
        CreateDateColumn,
        UpdateDateColumn,
        ManyToOne,
        JoinColumn } 
        from "typeorm";

import { table } from "src/configs/database_name";
import { Product } from "src/products/entities/product.entity";

@Entity({ name: `${ table.product_image }` })
export class ProductImage {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(() => Product, product => product.images)
    @JoinColumn({ name: 'product_id' })
    image: Product

    @Column({ type: 'varchar', nullable: false, unique: true })
    image_name: string

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;
}