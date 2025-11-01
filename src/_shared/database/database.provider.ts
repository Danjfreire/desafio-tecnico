import { DataSource } from 'typeorm';
import { UserEntity } from '../../v2/orders/entities/user.entity';
import { OrderEntity } from '../../v2/orders/entities/order.entity';
import { OrderProductEntity } from '../../v2/orders/entities/order-product.entity';

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_DATABASE || 'orders_db',
                entities: [UserEntity, OrderEntity, OrderProductEntity],
                synchronize: true, // in a real app we would use migrations
            });

            return dataSource.initialize();
        },
    },
];
