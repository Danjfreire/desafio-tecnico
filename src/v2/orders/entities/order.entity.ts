import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { OrderProductEntity } from './order-product.entity';

@Entity('orders')
export class OrderEntity {
    @PrimaryColumn()
    id: number;

    @Column()
    user_id: number;

    @ManyToOne(() => UserEntity, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @Column('timestamp')
    date: Date;

    @OneToMany(() => OrderProductEntity, product => product.order, { eager: true, cascade: true })
    products: OrderProductEntity[];
}
