import { Module } from '@nestjs/common';
import { OrdersV2Module } from './orders/orders.module';

@Module({
  imports: [OrdersV2Module]
})
export class V2Module { }
