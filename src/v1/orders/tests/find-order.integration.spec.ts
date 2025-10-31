import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { MemoryDbService } from '../../../_shared/memory-db/memory-db.service';
import { NotFoundException } from '@nestjs/common';
import { Order, User } from '../../../_shared/types/order.model';
import { OrdersModule } from '../orders.module';

describe('OrdersController - findOrder', () => {
    let controller: OrdersController;
    let memoryDb: MemoryDbService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [OrdersModule]
        }).compile();

        controller = module.get<OrdersController>(OrdersController);
        memoryDb = module.get<MemoryDbService>(MemoryDbService);
    });

    it('should throw NotFoundException when order id does not exist', () => {
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

        expect(() => controller.findOrder(999)).toThrow(NotFoundException);
    });

    it('should return order with user details for a valid order id', () => {
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

        memoryDb.populateDb(orders, users);

        const result = controller.findOrder(100);

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
