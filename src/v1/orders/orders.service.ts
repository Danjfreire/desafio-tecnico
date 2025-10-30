import { Injectable } from '@nestjs/common';
import { LegacyOrder } from 'src/_shared/legacy-util/legacy-converter';
import { OrdersRepository } from './orders.repository';

export interface Product {
    product_id: number;
    value: number;
}

export interface Order {
    user_id: number;
    order_id: number;
    total: number;
    date: Date;
    products: Product[];
}

export interface User {
    user_id: number;
    name: string;
}

export interface OrderResponse {
    user_id: number;
    name: string;
    orders: Omit<Order, "user_id">[]
}

@Injectable()
export class OrdersService {

}

