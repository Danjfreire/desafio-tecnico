import { Injectable } from '@nestjs/common';
import { LegacyOrder } from './models/legacy-order.model';
import { validate } from 'class-validator';
import { Order, User } from '../types/order.model';

@Injectable()
export class LegacyOrderService {

    public async parseLegacyOrders(data: string): Promise<{ success: boolean, data: LegacyOrder[] }> {
        const lines = data.split('\n');
        const orders: LegacyOrder[] = [];

        try {
            for (const line of lines) {
                // skip empty lines
                if (line.trim().length === 0) {
                    continue;
                }

                const userId = +(line.substring(0, 10).trim());
                const userName = line.substring(10, 55).trim();
                const orderId = +(line.substring(55, 65).trim());
                const prodId = +(line.substring(65, 75).trim());
                const value = +(line.substring(75, 87).trim());
                const date = line.substring(87, 95).trim();

                const dateyear = parseInt(date.substring(0, 4), 10);
                const datemonth = parseInt(date.substring(4, 6), 10) - 1;
                const dateday = parseInt(date.substring(6, 8), 10);

                const parsedOrder = new LegacyOrder();
                parsedOrder.userId = userId;
                parsedOrder.userName = userName;
                parsedOrder.orderId = orderId;
                parsedOrder.prodId = prodId;
                parsedOrder.value = value;
                parsedOrder.date = new Date(dateyear, datemonth, dateday);

                const errors = await validate(parsedOrder)

                if (errors.length > 0) {
                    return { success: false, data: [] };
                }

                orders.push(parsedOrder);
            }
        } catch (error) {
            return { success: false, data: [] };
        }


        return { success: true, data: orders };
    }


    public extractOrderData(legacyOrders: LegacyOrder[]): { orders: Order[], users: User[] } {
        const orders = new Map<number, Order>();
        const users = new Map<number, User>();

        for (const legacyOrder of legacyOrders) {
            const orderId = legacyOrder.orderId;
            const userId = legacyOrder.userId;

            users.set(userId, { user_id: userId, name: legacyOrder.userName });

            const order: Order = {
                user_id: legacyOrder.userId,
                order_id: legacyOrder.orderId,
                total: legacyOrder.value,
                date: legacyOrder.date,
                products: [
                    {
                        product_id: legacyOrder.prodId,
                        value: legacyOrder.value,
                    }
                ],
            }

            let storedOrder = orders.get(orderId);
            if (storedOrder) {
                // Update existing order
                storedOrder.total += legacyOrder.value;
                storedOrder.products.push({
                    product_id: legacyOrder.prodId,
                    value: legacyOrder.value,
                });
            } else {
                // New order
                orders.set(orderId, order);
            }
        }

        return {
            orders: Array.from(orders.values()),
            users: Array.from(users.values()),
        }
    }

}
