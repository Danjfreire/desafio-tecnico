import { BadRequestException, Controller, FileTypeValidator, Get, NotFoundException, Param, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LegacyOrderService } from 'src/_shared/legacy-order/legacy-order.service';
import { UserOrderResponse } from 'src/_shared/types/order-response.dto';
import { QueryOrdersDto } from 'src/_shared/types/query-orders.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders-v2')
@Controller('v2/orders')
export class OrdersV2Controller {

    constructor(
        private readonly ordersService: OrdersService,
        private readonly legacyOrderService: LegacyOrderService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Import legacy orders from a text file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Legacy orders text file',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Orders successfully imported' })
    @ApiResponse({ status: 400, description: 'Invalid file format or data' })
    @UseInterceptors(FileInterceptor('file'))
    async importLegacyOrders(@UploadedFile(new ParseFilePipe({
        validators: [
            new FileTypeValidator({ fileType: 'text/plain', skipMagicNumbersValidation: true }),
        ]
    })) file: Express.Multer.File) {
        const content = file.buffer.toString('utf-8');

        const { success, data: legacyOrders } = await this.legacyOrderService.parseLegacyOrders(content)

        if (!success) {
            throw new BadRequestException("Failed to parse orders, invalid entry found.")
        }

        console.log('Parsed legacy Orders:', legacyOrders.length);

        const { orders, users } = this.legacyOrderService.extractOrderData(legacyOrders);

        await this.ordersService.importOrders(orders, users);

        console.log('Orders imported:', orders.length);
        console.log('Users imported:', users.length);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find an order by ID' })
    @ApiResponse({
        status: 200,
        description: 'Order found successfully',
        type: UserOrderResponse
    })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async findOrder(
        @Param('id') id: number
    ): Promise<UserOrderResponse> {
        const res = await this.ordersService.findOrderById(Number(id));

        if (!res) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }

        return res;
    }

    @Get()
    @ApiOperation({ summary: 'List all orders with optional date filtering' })
    @ApiResponse({
        status: 200,
        description: 'List of orders retrieved successfully',
        type: [UserOrderResponse]
    })
    @ApiResponse({ status: 400, description: 'Invalid date range' })
    async listOrders(
        @Query() query?: QueryOrdersDto,
    ): Promise<UserOrderResponse[]> {
        const options = {
            startDate: query?.start_date ? new Date(query.start_date) : undefined,
            endDate: query?.end_date ? new Date(query.end_date) : undefined,
        }

        // end date must be greater than start date if both are provided
        if (options.startDate && options.endDate && options.endDate <= options.startDate) {
            throw new BadRequestException("end_date must be greater than start_date");
        }

        return this.ordersService.findOrders(options);
    }
}
