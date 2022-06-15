import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        description: "Product identifier: UUID, Power BI visual GUID, etc",
        example: {
            uuid: "5f95888a-6519-44bc-a08e-e76dda4621f1",
            visualGuid: "ClusteredStackedBarChart39ECD6FE50G",
        },
    })
    @IsString({ message: "Must be a string" })
    public readonly id: string;

    @ApiProperty({
        description: "Product vendor name",
    })
    @IsString({ message: "Must be a string" })
    public readonly vendor: string;

    @ApiPropertyOptional({
        description: "Product area",
        example: "Microsoft Power BI",
    })
    @IsString({ message: "Must be a string" })
    public readonly productArea: string;

    @ApiPropertyOptional({
        description: "Product type depending on the product area",
        example: "Power BI Custom Visual",
    })
    @IsString({ message: "Must be a string" })
    public readonly productType: string;

    @ApiProperty({
        description: "Product name",
    })
    @IsString({ message: "Must be a string" })
    public readonly productName: string;

    @ApiPropertyOptional({
        description: "Product description",
    })
    @IsString({ message: "Must be a string" })
    public readonly description: string;
}
