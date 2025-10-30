import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { MemoryDbModule } from 'src/_shared/memory-db/memory-db.module';

@Module({
  imports: [MemoryDbModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository]
})
export class OrdersModule { }
