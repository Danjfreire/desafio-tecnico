import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { V1Module } from './v1/v1.module';
import { V2Module } from './v2/v2.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './v2/orders/entities/user.entity';
import { OrderEntity } from './v2/orders/entities/order.entity';
import { OrderProductEntity } from './v2/orders/entities/order-product.entity';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.example',
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string(),
        POSTGRES_PORT: Joi.number(),
        POSTGRES_USER: Joi.string(),
        POSTGRES_PASSWORD: Joi.string(),
        POSTGRES_DB: Joi.string(),
      })
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [UserEntity, OrderEntity, OrderProductEntity],
      synchronize: true, // in a real app we would use migrations
    }),
    V1Module,
    V2Module,
  ],
})
export class AppModule { }
