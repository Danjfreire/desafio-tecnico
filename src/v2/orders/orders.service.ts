import { Injectable } from '@nestjs/common';
import { Repository, DataSource, Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { UserEntity } from './entities/user.entity';
import { OrderProductEntity } from './entities/order-product.entity';
import { Order, User } from 'src/_shared/types/order.model';
import { UserOrderResponse } from 'src/_shared/types/order-response.dto';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class OrdersV2Service {

    constructor(
        @InjectDataSource()
        private dataSource: DataSource,
        @InjectRepository(OrderEntity)
        private orderRepository: Repository<OrderEntity>,
    ) {
    }

    async importOrders(orders: Order[], users: User[]): Promise<void> {
        if (users.length === 0 && orders.length === 0) {
            return;
        }

        await this.dataSource.transaction(async (manager) => {
            // users
            await manager.insert(UserEntity, users.map(user => ({
                id: user.user_id,
                name: user.name,
            })));

            // orders
            await manager.insert(OrderEntity, orders.map(order => ({
                id: order.order_id,
                user_id: order.user_id,
                total: order.total,
                date: order.date,
            })));

            // products
            const allProducts = orders.flatMap(order =>
                order.products.map(product => ({
                    product_id: product.product_id,
                    value: product.value,
                    order_id: order.order_id,
                }))
            );

            await manager.insert(OrderProductEntity, allProducts);
        });
    }

    async findOrderById(orderId: number): Promise<UserOrderResponse | null> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'products'],
        });

        if (!order) {
            return null;
        }

        return UserOrderResponse.fromEntity(order);
    }

    async findOrders(options?: { startDate?: Date; endDate?: Date }): Promise<UserOrderResponse[]> {
        let whereCondition: FindOptionsWhere<OrderEntity> = {};

        if (options?.startDate && options?.endDate) {
            whereCondition.date = Between(options.startDate, options.endDate);
        } else if (options?.startDate) {
            whereCondition.date = MoreThanOrEqual(options.startDate);
        } else if (options?.endDate) {
            whereCondition.date = LessThanOrEqual(options.endDate);
        }

        const orders = await this.orderRepository.find({
            where: whereCondition,
            relations: ['user', 'products'],
            order: { user_id: 'ASC', id: 'ASC' },
        });

        return UserOrderResponse.fromEntities(orders);
    }
}
