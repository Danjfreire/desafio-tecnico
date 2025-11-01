import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsDateString, IsOptional, IsString } from "class-validator";

export class QueryOrdersDto {

    @ApiProperty({ example: '2021-10-29' })
    @IsOptional()
    @IsDateString()
    public readonly start_date?: string;

    @ApiProperty({ example: '2021-10-30' })
    @IsOptional()
    @IsDateString()
    public readonly end_date?: string;
}