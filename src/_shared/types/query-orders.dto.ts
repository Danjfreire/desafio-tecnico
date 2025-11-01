import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsDateString, IsOptional, IsString } from "class-validator";

export class QueryOrdersDto {

    @ApiProperty({ example: '2021-10-29', required: false })
    @IsOptional()
    @IsDateString()
    public readonly start_date?: string;

    @ApiProperty({ example: '2021-10-30', required: false })
    @IsOptional()
    @IsDateString()
    public readonly end_date?: string;
}