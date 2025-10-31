import { Test, TestingModule } from '@nestjs/testing';
import { LegacyOrderService } from '../legacy-order.service';

const VALID_SINGLE_ORDER = '0000000070                              Palmer Prosacco00000007530000000003     1836.7420210308';
const VALID_MULTIPLE_ORDERS = `0000000075                                  Bobbie Batz00000007980000000002     1578.5720211116
0000000049                               Ken Wintheiser00000005230000000003      586.7420210903
0000000014                                 Clelia Hills00000001460000000001      673.4920211125`;
const VALID_WITH_EMPTY_LINES = `0000000001                              Sammie Baumbach00000000070000000002       96.4720210528

0000000002                           Augustus Aufderhar00000000220000000000       190.820210530`;

describe('LegacyOrderService - parseLegacyOrders', () => {
  let service: LegacyOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegacyOrderService],
    }).compile();

    service = module.get<LegacyOrderService>(LegacyOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should successfully parse a single valid order', async () => {
    const result = await service.parseLegacyOrders(VALID_SINGLE_ORDER);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].userId).toBe(70);
    expect(result.data[0].userName).toBe('Palmer Prosacco');
    expect(result.data[0].orderId).toBe(753);
    expect(result.data[0].prodId).toBe(3);
    expect(result.data[0].value).toBe(1836.74);
    expect(result.data[0].date).toEqual(new Date(2021, 2, 8)); // March 8, 2021
  });

  it('should successfully parse multiple valid orders', async () => {
    const result = await service.parseLegacyOrders(VALID_MULTIPLE_ORDERS);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);

    expect(result.data[0].userId).toBe(75);
    expect(result.data[0].userName).toBe('Bobbie Batz');
    expect(result.data[0].orderId).toBe(798);

    expect(result.data[1].userId).toBe(49);
    expect(result.data[1].userName).toBe('Ken Wintheiser');
    expect(result.data[1].orderId).toBe(523);

    expect(result.data[2].userId).toBe(14);
    expect(result.data[2].userName).toBe('Clelia Hills');
    expect(result.data[2].orderId).toBe(146);
  });

  it('should skip empty lines when parsing', async () => {
    const result = await service.parseLegacyOrders(VALID_WITH_EMPTY_LINES);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].userId).toBe(1);
    expect(result.data[1].userId).toBe(2);
  });

  it('should fail when parsing data with invalid userId', async () => {
    // string instead of number for userId
    const invalidData = '0000userId                              Palmer Prosacco00000007530000000003     1836.7420210308';

    const result = await service.parseLegacyOrders(invalidData);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(0);
  });

  it('should fail when parsing data with invalid userName', async () => {
    const invalidData = '0000000070                                             00000007530000000003     1836.7420210308';

    const result = await service.parseLegacyOrders(invalidData);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(0);
  });

  it('should fail when parsing data with invalid orderId', async () => {
    const invalidData = '0000000070                              Palmer Prosacco00000order0000000003     1836.7420210308';

    const result = await service.parseLegacyOrders(invalidData);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(0);
  });

  it('should fail when parsing data with invalid prodId', async () => {
    const invalidData = '0000000070                              Palmer Prosacco0000000753000000prod     1836.7420210308';

    const result = await service.parseLegacyOrders(invalidData);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(0);
  });

  it('should return fail when parsing data with invalid value', async () => {
    // string instead of number for value
    const invalidData = '0000000070                              Palmer Prosacco00000007530000000003    value.7420210308';

    const result = await service.parseLegacyOrders(invalidData);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(0);
  });

  it('should fail when parsing data with invalid date', async () => {
    const invalidData = '0000000070                              Palmer Prosacco00000007530000000003     1836.742021date';

    const result = await service.parseLegacyOrders(invalidData);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(0);
  });

  it('should fail when parsing data with completely different format', async () => {
    const invalidData = 'this is a completely different format string that should not be parsed correctly';

    const result = await service.parseLegacyOrders(invalidData);

    expect(result.success).toBe(false);
    expect(result.data).toHaveLength(0);
  });

});
