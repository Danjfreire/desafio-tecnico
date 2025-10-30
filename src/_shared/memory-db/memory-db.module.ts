import { Module } from '@nestjs/common';
import { MemoryDbService } from './memory-db.service';

@Module({
  providers: [MemoryDbService],
  exports: [MemoryDbService],
})
export class MemoryDbModule { }
