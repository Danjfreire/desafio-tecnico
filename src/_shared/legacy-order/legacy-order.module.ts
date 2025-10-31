import { Module } from '@nestjs/common';
import { LegacyOrderService } from './legacy-order.service';

@Module({
  providers: [LegacyOrderService],
  exports: [LegacyOrderService],
})
export class LegacyOrderModule { }
