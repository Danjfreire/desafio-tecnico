import { Module } from '@nestjs/common';
import { OrdersV2Controller } from './orders.controller';
import { OrdersService } from './orders.service';
import { LegacyOrderModule } from 'src/_shared/legacy-order/legacy-order.module';
import { DatabaseModule } from 'src/_shared/database/database.module';

@Module({
    imports: [DatabaseModule, LegacyOrderModule],
    controllers: [OrdersV2Controller],
    providers: [OrdersService],
})
export class OrdersV2Module { }
