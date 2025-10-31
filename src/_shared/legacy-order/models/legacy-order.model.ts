import { Transform } from "class-transformer";
import { IsDate, IsNumber, IsString, Length, Max, Min } from "class-validator";

/**
 * Format:
 * userId,userName,orderId,prodId,value,date
 * 
 * userId - numeric | length 10 | 0 padded
 * userName - text | length 45 | space padded
 * orderId - numeric | length 10 | 0 padded
 * prodId - numeric  | length 10 | 0 padded
 * value - numeric (decimal)| length 12 | space padded 
 * date - numerics (YYYYMMDD) | length 8
 */
export class LegacyOrder {
    @IsNumber()
    @Min(0)
    @Max(9999999999)
    userId: number;

    @IsString()
    @Length(1, 45)
    userName: string;

    @IsNumber()
    @Min(0)
    @Max(9999999999)
    orderId: number;

    @IsNumber()
    @Min(0)
    @Max(9999999999)
    prodId: number;

    @IsNumber()
    @Min(0)
    @Max(9999999999.99)
    value: number;

    @IsDate()
    @Transform(({ value }) => value instanceof Date ? value : new Date(value))
    date: Date;
}