import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsString, Length, Max, Min, validate, validateSync } from "class-validator";
import { Order, User } from "src/v1/orders/orders.service";

export class LegacyOrder {
    @IsNumber()
    @Min(0)
    @Max(9999999999)
    userId: number;

    @IsString()
    @Length(1, 45)
    userName: string;

    @IsNumber()
    @Min(0)
    @Max(9999999999)
    orderId: number;

    @IsNumber()
    @Min(0)
    @Max(9999999999)
    prodId: number;

    @IsNumber()
    @Min(0)
    @Max(9999999999.99)
    value: number;

    @IsDate()
    @Transform(({ value }) => value instanceof Date ? value : new Date(value))
    date: Date;
}

/**
 * Format:
 * userId,userName,orderId,prodId,value,date
 * 
 * userId - numeric | length 10 | 0 padded
 * userName - text | length 45 | space padded
 * orderId - numeric | length 10 | 0 padded
 * prodId - numeric  | length 10 | 0 padded
 * value - numeric (decimal)| length 12 | space padded 
 * date - numerics (YYYYMMDD) | length 8
 */


export async function parseLegacyOrders(data: string): Promise<{ success: boolean, data: LegacyOrder[] }> {
    const lines = data.split('\n');
    const orders: LegacyOrder[] = [];

    for (const line of lines) {
        // skip empty lines
        if (line.trim().length === 0) {
            continue;
        }

        const userId = parseInt(line.substring(0, 10).trim(), 10);
        const userName = line.substring(10, 55).trim();
        const orderId = parseInt(line.substring(55, 65).trim(), 10);
        const prodId = parseInt(line.substring(65, 75).trim(), 10);
        const value = parseFloat(line.substring(75, 87).trim());
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

    return { success: true, data: orders };
}

export function extractOrderData(legacyOrders: LegacyOrder[]): { orders: Order[], users: User[] } {
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