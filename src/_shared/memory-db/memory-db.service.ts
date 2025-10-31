import { Injectable } from '@nestjs/common';
import { Order, UserOrder, User } from '../types/order.model';

@Injectable()
export class MemoryDbService {
    private orders: Map<number, Order> = new Map();
    private users: Map<number, User> = new Map();

    populateDb(orders: Order[], users: User[]) {
        for (const order of orders) {
            this.orders.set(order.order_id, order);
        }

        for (const user of users) {
            this.users.set(user.user_id, user);
        }
    }

    findOne(id: number): UserOrder | null {
        const order = this.orders.get(id);
        if (!order) {
            return null;
        }

        const res: UserOrder = {
            user_id: order.user_id,
            name: this.users.get(order.user_id)!.name,
            orders: [{
                order_id: order.order_id,
                total: order.total,
                date: order.date,
                products: order.products,
            }],
        }

        return res;
    }

    findMany(options?: { startDate?: Date, endDate?: Date }): UserOrder[] {

        const validOrders = Array.from(this.orders.values()).filter(order => {
            if (options?.startDate && order.date < options.startDate) {
                return false;
            }

            if (options?.endDate && order.date > options.endDate) {
                return false;
            }

            return true;
        });

        const resultsMap: Map<number, UserOrder> = new Map();

        for (const order of validOrders) {
            let existing = resultsMap.get(order.user_id);
            if (existing) {
                existing.orders.push({ order_id: order.order_id, total: order.total, date: order.date, products: order.products });
            } else {
                resultsMap.set(order.user_id, {
                    user_id: order.user_id,
                    name: this.users.get(order.user_id)!.name,
                    orders: [{ order_id: order.order_id, total: order.total, date: order.date, products: order.products }],
                });
            }
        }

        return Array.from(resultsMap.values());
    }
}
