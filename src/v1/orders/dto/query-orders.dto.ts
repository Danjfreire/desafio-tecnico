import { Transform, Type } from "class-transformer";
import { IsDate, IsDateString, IsOptional, IsString } from "class-validator";

export class QueryOrdersDto {

    @IsOptional()
    @IsDateString()
    public readonly start_date?: string;

    @IsOptional()
    @IsDateString()
    public readonly end_date?: string;
}