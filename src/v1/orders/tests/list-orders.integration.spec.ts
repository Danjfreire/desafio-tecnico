import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { MemoryDbService } from '../../../_shared/memory-db/memory-db.service';
import { BadRequestException } from '@nestjs/common';
import { Order, User } from '../../../_shared/types/order.model';
import { OrdersModule } from '../orders.module';

describe('OrdersController - listOrders', () => {
    let controller: OrdersController;
    let memoryDb: MemoryDbService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [OrdersModule]
        }).compile();

        controller = module.get<OrdersController>(OrdersController);
        memoryDb = module.get<MemoryDbService>(MemoryDbService);
    });

    it('should return all orders when no filters are provided', () => {
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

        memoryDb.populateDb(orders, users);

        const result = controller.listOrders();

        expect(result).toHaveLength(2);
        expect(result[0].user_id).toBe(1);
        expect(result[0].name).toBe('John');
        expect(result[1].orders).toHaveLength(1);
        expect(result[1].orders[0]).toEqual({
            order_id: 101,
            total: 200.00,
            date: new Date('2025-02-20'),
            products: [{ product_id: 2, value: 200.00 }]
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

    it('should filter orders by start date', () => {
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

        memoryDb.populateDb(orders, users);

        const result = controller.listOrders({ start_date: '2025-02-01' });

        expect(result).toHaveLength(1);
        expect(result[0].user_id).toBe(2);
        expect(result[0].orders[0].order_id).toBe(101);
    });

    it('should filter orders by end date', () => {
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

        memoryDb.populateDb(orders, users);

        const result = controller.listOrders({ end_date: '2025-01-31' });

        expect(result).toHaveLength(1);
        expect(result[0].user_id).toBe(1);
        expect(result[0].orders[0].order_id).toBe(100);
    });

    it('should filter orders by both start and end date', () => {
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

        memoryDb.populateDb(orders, users);

        const result = controller.listOrders({
            start_date: '2025-02-01',
            end_date: '2025-03-01'
        });

        expect(result).toHaveLength(1);
        expect(result[0].user_id).toBe(2);
        expect(result[0].orders[0].order_id).toBe(101);
    });

    it('should throw BadRequestException when end_date is not greater than start_date', () => {
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

        memoryDb.populateDb(orders, users);

        expect(() => controller.listOrders({
            start_date: '2025-02-20',
            end_date: '2025-02-20'
        })).toThrow(BadRequestException);

        expect(() => controller.listOrders({
            start_date: '2025-03-01',
            end_date: '2025-02-20'
        })).toThrow(BadRequestException);
    });

    it('should group multiple orders from the same user', () => {
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

        memoryDb.populateDb(orders, users);

        const result = controller.listOrders();

        expect(result).toHaveLength(1);
        expect(result[0].user_id).toBe(1);
        expect(result[0].name).toBe('John');
        expect(result[0].orders).toHaveLength(2);
        expect(result[0].orders[0].order_id).toBe(100);
        expect(result[0].orders[1].order_id).toBe(101);
    });

    it('should return empty array when no orders are found', () => {
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

        memoryDb.populateDb(orders, users);

        const result = controller.listOrders({ start_date: '2025-06-01' });

        expect(result).toHaveLength(0);
    });
});
