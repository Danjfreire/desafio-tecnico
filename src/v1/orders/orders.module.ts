import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { MemoryDbModule } from 'src/_shared/memory-db/memory-db.module';
import { LegacyOrderModule } from 'src/_shared/legacy-order/legacy-order.module';

@Module({
  imports: [MemoryDbModule, LegacyOrderModule],
  controllers: [OrdersController],
})
export class OrdersModule { }
