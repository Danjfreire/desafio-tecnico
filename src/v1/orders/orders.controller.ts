import { BadRequestException, Body, Controller, FileTypeValidator, Get, NotFoundException, Param, ParseDatePipe, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extractOrderData, parseLegacyOrders } from 'src/_shared/legacy-util/legacy-converter';
import { MemoryDbService } from 'src/_shared/memory-db/memory-db.service';
import { QueryOrdersDto } from './dto/query-orders.dto';

@Controller('v1/orders')
export class OrdersController {

    constructor(
        private readonly memoryDb: MemoryDbService
    ) { }

    /**
     *  Endpoint to handle upload of order files from the legacy system 
     */
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile(new ParseFilePipe({
        validators: [
            new FileTypeValidator({ fileType: 'text/plain', skipMagicNumbersValidation: true }),
        ]
    })) file: Express.Multer.File) {
        const content = file.buffer.toString('utf-8');

        const { success, data: legacyOrders } = await parseLegacyOrders(content)

        if (!success) {
            throw new BadRequestException("Failed to parse orders, invalid entry found.")
        }

        console.log('Parsed legacy Orders:', legacyOrders.length);

        const { orders, users } = extractOrderData(legacyOrders);
        this.memoryDb.populateDb(orders, users);

        console.log('Orders imported:', orders.length);
        console.log('Users imported:', users.length);
    }

    @Get(':id')
    findOrder(
        @Param('id') id: number
    ) {
        const res = this.memoryDb.findOne(Number(id));

        if (!res) {
            throw new NotFoundException(`Order with id ${id} not found`);
        }

        return res;
    }

    @Get()
    listOrders(
        @Query() query?: QueryOrdersDto,
    ) {
        const options = {
            startDate: query?.start_date ? new Date(query.start_date) : undefined,
            endDate: query?.end_date ? new Date(query.end_date) : undefined,
        }

        // end date must be greater than start date if both are provided
        if (options.startDate && options.endDate && options.endDate <= options.startDate) {
            throw new BadRequestException("end_date must be greater than start_date");
        }

        return this.memoryDb.findMany(options);
    }
}
