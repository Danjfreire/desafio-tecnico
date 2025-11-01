import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('products')
export class OrderProductEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    product_id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    value: number;

    @ManyToOne(() => OrderEntity, order => order.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: OrderEntity;

    @Column()
    order_id: number;
}
