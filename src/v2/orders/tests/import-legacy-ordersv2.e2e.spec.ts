import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import * as path from "node:path"
import { initPostgresTestContainer } from 'src/_shared/test-utils/database-utils';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../entities/order.entity';
import { UserEntity } from '../entities/user.entity';
import { OrderProductEntity } from '../entities/order-product.entity';
import { OrdersV2Module } from '../orders.module';
import { Client } from 'pg';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

const VALID_TEST_FILE_PATH = path.join(__dirname, '../../../../test_data/data_1.txt');
const INVALID_FILE_FORMAT_PATH = path.join(__dirname, '../../../../test_data/invalid_file_type.json');
const INVALID_TEST_FILE_PATH = path.join(__dirname, '../../../../test_data/invalid_data.txt');

describe('OrdersV2Controller - importLegacyOrders (e2e)', () => {
    jest.setTimeout(60000);
    let app: INestApplication;
    let postgresClient: Client;
    let postgresContainer: StartedPostgreSqlContainer;

    beforeAll(async () => {
        const { client, container } = await initPostgresTestContainer();
        postgresClient = client;
        postgresContainer = container;

        const module = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: postgresContainer.getHost(),
                    port: postgresContainer.getMappedPort(5432),
                    username: postgresContainer.getUsername(),
                    password: postgresContainer.getPassword(),
                    database: postgresContainer.getDatabase(),
                    entities: [OrderEntity, UserEntity, OrderProductEntity],
                    synchronize: true,
                }),
                OrdersV2Module
            ],
        }).compile();
        app = module.createNestApplication();
        await app.init();

        jest.spyOn(console, 'log').mockImplementation();
    });

    afterAll(async () => {
        await postgresClient.end();
        await postgresContainer.stop();
    });

    it('should import orders from a valid uploaded file', async () => {
        await request(app.getHttpServer())
            .post('/v2/orders')
            .attach('file', VALID_TEST_FILE_PATH)
            .expect(201)
    });

    it('should return BadRequest (400) if file is missing', async () => {
        const res = await request(app.getHttpServer())
            .post('/v2/orders')
            .expect(400)

        expect(res.body.message).toContain('File is required');
    })

    it('should return BadRequest (400) if file is not text/plain', async () => {
        const res = await request(app.getHttpServer())
            .post('/v2/orders')
            .attach('file', INVALID_FILE_FORMAT_PATH)
            .expect(400)

        expect(res.body.message).toContain('expected type is text/plain');
    })

    it('should return BadRequest (400) if file contains invalid order entries', async () => {
        const res = await request(app.getHttpServer())
            .post('/v2/orders')
            .attach('file', INVALID_TEST_FILE_PATH)
            .expect(400)

        expect(res.body.message).toBe("Failed to parse orders, invalid entry found.");
    });

});
