import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { parseLegacyOrders } from 'src/_shared/legacy-converter';
import { buffer } from 'stream/consumers';

@Controller('v1/orders')
export class OrdersController {

    /**
     *  Endpoint to handle upload of order files from the legacy system 
     */
    @Post('legacy-upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const content = file.buffer.toString('utf-8');

        const legacyOrders = parseLegacyOrders(content)
        console.log('Converted Orders:', legacyOrders.slice(0, 10));
    }

}
