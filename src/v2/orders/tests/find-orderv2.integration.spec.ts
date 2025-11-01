import { Test } from '@nestjs/testing';
import { OrdersV2Module } from '../orders.module';
import { OrdersV2Controller } from '../orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { clearDatabase, initPostgresTestContainer } from 'src/_shared/test-utils/database-utils';
import { Client } from 'pg';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { OrderEntity } from '../entities/order.entity';
import { UserEntity } from '../entities/user.entity';
import { OrderProductEntity } from '../entities/order-product.entity';
import { OrdersV2Service } from '../orders.service';
import { Order, User } from 'src/_shared/types/order.model';
import { NotFoundException } from '@nestjs/common';

describe('OrdersV2Controller - findOrder', () => {
    jest.setTimeout(60000);
    let controller: OrdersV2Controller;
    let service: OrdersV2Service
    let postgresClient: Client;
    let postgresContainer: StartedPostgreSqlContainer;

    beforeAll(async () => {
        const { client, container } = await initPostgresTestContainer();
        postgresClient = client;
        postgresContainer = container;

        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: postgresContainer.getHost(),
                    port: postgresContainer.getMappedPort(5432),
                    username: postgresContainer.getUsername(),
                    password: postgresContainer.getPassword(),
                    database: postgresContainer.getDatabase(),
                    entities: [OrderEntity, UserEntity, OrderProductEntity],
                    synchronize: true,
                }),
                OrdersV2Module
            ],
        }).compile();

        controller = module.get<OrdersV2Controller>(OrdersV2Controller);
        service = module.get<OrdersV2Service>(OrdersV2Service);
    });

    afterEach(async () => {
        await clearDatabase(postgresClient)
    })

    afterAll(async () => {
        await postgresClient!.end();
        await postgresContainer!.stop();
    });

    it('should throw NotFoundException when order id does not exist', async () => {
        const users: User[] = [{ user_id: 1, name: 'John' }];
        const orders: Order[] = [
            {
                user_id: 1,
                order_id: 100,
                total: 150.50,
                date: new Date('2025-01-15'),
                products: [{ product_id: 1, value: 150.50 }]
            }
        ];

        await service.importOrders(orders, users);

        try {
            await controller.findOrder(999);
            fail()
        } catch (error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }

    });

    it('should return order with user details for a valid order id', async () => {
        const users: User[] = [
            { user_id: 1, name: 'John' }
        ];

        const orders: Order[] = [
            {
                user_id: 1,
                order_id: 100,
                total: 150.50,
                date: new Date('2025-01-15'),
                products: [
                    { product_id: 1, value: 100.00 },
                    { product_id: 2, value: 50.50 }
                ]
            }
        ];

        await service.importOrders(orders, users);

        const result = await controller.findOrder(100);

        expect(result.user_id).toBe(1);
        expect(result.name).toBe('John');
        expect(result.orders).toHaveLength(1);
        expect(result.orders[0].order_id).toBe(100);
        expect(result.orders[0].total).toBe(150.50);
        expect(result.orders[0].date).toEqual(new Date('2025-01-15'));
        expect(result.orders[0].products).toHaveLength(2);
        expect(result.orders[0].products[0]).toEqual({ product_id: 1, value: 100.00 });
        expect(result.orders[0].products[1]).toEqual({ product_id: 2, value: 50.50 });
    });

});
