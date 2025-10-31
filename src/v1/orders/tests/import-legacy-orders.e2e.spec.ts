import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MemoryDbService } from '../../../_shared/memory-db/memory-db.service';
import { OrdersModule } from '../orders.module';
import * as path from "node:path"

const VALID_TEST_FILE_PATH = path.join(__dirname, '../../../../test_data/data_1.txt');
const INVALID_FILE_FORMAT_PATH = path.join(__dirname, '../../../../test_data/invalid_file_type.json');
const INVALID_TEST_FILE_PATH = path.join(__dirname, '../../../../test_data/invalid_data.txt');

describe('OrdersController - importLegacyOrders (e2e)', () => {
    let app: INestApplication;
    let memoryDb: MemoryDbService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [OrdersModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();
        memoryDb = moduleFixture.get<MemoryDbService>(MemoryDbService);

        // avoid console.log during tests
        jest.spyOn(console, 'log').mockImplementation()
    });

    afterEach(async () => {
        await app.close();
    });

    it('should import orders from a valid uploaded file', async () => {
        await request(app.getHttpServer())
            .post('/v1/orders')
            .attach('file', VALID_TEST_FILE_PATH)
            .expect(201)

        // the test file contains 100 users with a total of 1084 orders
        const res = memoryDb.findMany()
        expect(res.length).toEqual(100);

        let orderCount = 0;
        res.forEach(userOrder => {
            orderCount += userOrder.orders.length;
        });
        expect(orderCount).toEqual(1084);
    });

    it('should return BadRequest (400) if file is missing', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/orders')
            .expect(400)

        expect(res.body.message).toContain('File is required');
    })

    it('should return BadRequest (400) if file is not text/plain', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/orders')
            .attach('file', INVALID_FILE_FORMAT_PATH)
            .expect(400)

        expect(res.body.message).toContain('expected type is text/plain');
    })

    it('should return BadRequest (400) if file contains invalid order entries', async () => {
        const res = await request(app.getHttpServer())
            .post('/v1/orders')
            .attach('file', INVALID_TEST_FILE_PATH)
            .expect(400)

        expect(res.body.message).toBe("Failed to parse orders, invalid entry found.");
    });

});
