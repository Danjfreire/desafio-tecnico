import { Module } from '@nestjs/common';
import { OrdersV2Controller } from './orders.controller';
import { OrdersV2Service } from './orders.service';
import { LegacyOrderModule } from 'src/_shared/legacy-order/legacy-order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OrderEntity]), LegacyOrderModule],
    controllers: [OrdersV2Controller],
    providers: [OrdersV2Service],
})
export class OrdersV2Module { }
