import { Entity,
        PrimaryGeneratedColumn,
        Column,
        CreateDateColumn,
        ManyToOne,
        JoinColumn, 
        } 
        from "typeorm";

import { User } from "src/users/entities/user.entity";
import { table } from "src/configs/database_name";

@Entity({ name: `${table.log}` })
export class Log {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.logs, { nullable: false })
    @JoinColumn({ name: 'user_id' })
    user: User;

     @Column({ type: 'varchar' })
    action: string
    
    @Column({ type: 'text' })
    description: string

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

}
