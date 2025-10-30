import { Injectable } from '@nestjs/common';
import { Order, OrderResponse, User } from './orders.service';

@Injectable()
export class OrdersRepository {

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


}
