import { Test } from '@nestjs/testing';
import { Order, User } from '../../../_shared/types/order.model';
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
import { BadRequestException } from '@nestjs/common';

describe('OrdersV2Controller - listOrders', () => {
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

    it('should return all orders when no filters are provided', async () => {
        const users: User[] = [
            { user_id: 1, name: 'John' },
            { user_id: 2, name: 'Jane' }
        ];

        const orders: Order[] = [
            {
                user_id: 1,
                order_id: 100,
                total: 150.50,
                date: new Date('2025-01-15'),
                products: [{ product_id: 1, value: 150.50 }]
            },
            {
                user_id: 2,
                order_id: 101,
                total: 200.00,
                date: new Date('2025-02-20'),
                products: [{ product_id: 2, value: 200.00 }]
            }
        ];

        await service.importOrders(orders, users);

        const result = await controller.listOrders();

        expect(result).toHaveLength(2);
        expect(result[0].user_id).toBe(1);
        expect(result[0].name).toBe('John');
        expect(result[0].orders).toHaveLength(1);
        expect(result[0].orders[0]).toEqual({
            order_id: 100,
            total: 150.50,
            date: new Date('2025-01-15'),
            products: [{ product_id: 1, value: 150.50 }]
        });

        expect(result[1].user_id).toBe(2);
        expect(result[1].name).toBe('Jane');
        expect(result[1].orders).toHaveLength(1);
        expect(result[1].orders[0]).toEqual({
            order_id: 101,
            total: 200.00,
            date: new Date('2025-02-20'),
            products: [{ product_id: 2, value: 200.00 }]
        });
    });

    it('should filter orders by start date', async () => {
        const users: User[] = [
            { user_id: 1, name: 'John' },
            { user_id: 2, name: 'Jane' }
        ];

        const orders: Order[] = [
            {
                user_id: 1,
                order_id: 100,
                total: 150.50,
                date: new Date('2025-01-15'),
                products: [{ product_id: 1, value: 150.50 }]
            },
            {
                user_id: 2,
                order_id: 101,
                total: 200.00,
                date: new Date('2025-02-20'),
                products: [{ product_id: 2, value: 200.00 }]
            }
        ];

        await service.importOrders(orders, users);

        const result = await controller.listOrders({ start_date: '2025-02-01' });

        expect(result).toHaveLength(1);
        expect(result[0].user_id).toBe(2);
        expect(result[0].orders[0].order_id).toBe(101);
    });

    it('should filter orders by end date', async () => {
        const users: User[] = [
            { user_id: 1, name: 'John' },
            { user_id: 2, name: 'Jane' }
        ];

        const orders: Order[] = [
            {
                user_id: 1,
                order_id: 100,
                total: 150.50,
                date: new Date('2025-01-15'),
                products: [{ product_id: 1, value: 150.50 }]
            },
            {
                user_id: 2,
                order_id: 101,
                total: 200.00,
                date: new Date('2025-02-20'),
                products: [{ product_id: 2, value: 200.00 }]
            }
        ];

        await service.importOrders(orders, users);

        const result = await controller.listOrders({ end_date: '2025-01-31' });

        expect(result).toHaveLength(1);
        expect(result[0].user_id).toBe(1);
        expect(result[0].orders[0].order_id).toBe(100);
    });

    it('should filter orders by both start and end date', async () => {
        const users: User[] = [
            { user_id: 1, name: 'John' },
            { user_id: 2, name: 'Jane' },
            { user_id: 3, name: 'Bob' }
        ];

        const orders: Order[] = [
            {
                user_id: 1,
                order_id: 100,
                total: 150.50,
                date: new Date('2025-01-15'),
                products: [{ product_id: 1, value: 150.50 }]
            },
            {
                user_id: 2,
                order_id: 101,
                total: 200.00,
                date: new Date('2025-02-20'),
                products: [{ product_id: 2, value: 200.00 }]
            },
            {
                user_id: 3,
                order_id: 102,
                total: 300.00,
                date: new Date('2025-03-25'),
                products: [{ product_id: 3, value: 300.00 }]
            }
        ];

        await service.importOrders(orders, users);

        const result = await controller.listOrders({
            start_date: '2025-02-01',
            end_date: '2025-03-01'
        });

        expect(result).toHaveLength(1);
        expect(result[0].user_id).toBe(2);
        expect(result[0].orders[0].order_id).toBe(101);
    });

    it('should throw BadRequestException when end_date is not greater than start_date', async () => {
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
            await controller.listOrders({
                start_date: '2025-02-20',
                end_date: '2025-02-20'
            });
            fail();
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);
        }

        try {
            await controller.listOrders({
                start_date: '2025-03-01',
                end_date: '2025-02-20'
            });
            fail();
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);
        }
    });

    it('should group multiple orders from the same user', async () => {
        const users: User[] = [
            { user_id: 1, name: 'John' }
        ];

        const orders: Order[] = [
            {
                user_id: 1,
                order_id: 100,
                total: 150.50,
                date: new Date('2025-01-15'),
                products: [{ product_id: 1, value: 150.50 }]
            },
            {
                user_id: 1,
                order_id: 101,
                total: 200.00,
                date: new Date('2025-02-20'),
                products: [{ product_id: 2, value: 200.00 }]
            }
        ];

        await service.importOrders(orders, users);

        const result = await controller.listOrders();

        expect(result).toHaveLength(1);
        expect(result[0].user_id).toBe(1);
        expect(result[0].name).toBe('John');
        expect(result[0].orders).toHaveLength(2);
        expect(result[0].orders[0].order_id).toBe(100);
        expect(result[0].orders[1].order_id).toBe(101);
    });

    it('should return empty array when no orders are found', async () => {
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

        const result = await controller.listOrders({ start_date: '2025-06-01' });

        expect(result).toHaveLength(0);
    });
});
