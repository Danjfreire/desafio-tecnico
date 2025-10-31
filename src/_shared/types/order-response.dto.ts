import { ApiProperty } from "@nestjs/swagger";

export class ProductResponse {
    @ApiProperty({ example: 1, description: 'Product ID' })
    product_id: number;

    @ApiProperty({ example: 150.50, description: 'Product value' })
    value: number;
}

export class OrderDetailResponse {
    @ApiProperty({ example: 100, description: 'Order ID' })
    order_id: number;

    @ApiProperty({ example: 1836.74, description: 'Total order value' })
    total: number;

    @ApiProperty({ example: '2021-03-08T00:00:00.000Z', description: 'Order date' })
    date: Date;

    @ApiProperty({ type: [ProductResponse], description: 'List of products in the order' })
    products: ProductResponse[];
}

export class UserOrderResponse {
    @ApiProperty({ example: 70, description: 'User ID' })
    user_id: number;

    @ApiProperty({ example: 'Palmer Prosacco', description: 'User name' })
    name: string;

    @ApiProperty({ type: [OrderDetailResponse], description: 'List of orders for this user' })
    orders: OrderDetailResponse[];
}
