import { ApiProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { IsDate, IsString, IsUUID } from "class-validator";
import { isValidDate } from "src/utils/functions";

export class CreateLicenseKeyDto {
    @ApiProperty({
        type: String,
        description: "Product identifier: UUID, Power BI visual GUID, etc",
        example: {
            uuid: "5f95888a-6519-44bc-a08e-e76dda4621f1",
            visualGuid: "ClusteredStackedBarChart39ECD6FE50G",
        },
    })
    @IsString({ message: "Must be a string" })
    public readonly productId: string;

    @ApiProperty({
        type: String,
        description: "Purchaser UUID",
        example: "f669f60e-dc81-4144-af39-4e2792af72d9",
    })
    @IsUUID(4, { message: "Must be a UUIDV4 type" })
    public readonly purchaserId: string;

    @ApiProperty({
        type: String,
        description: "License key type",
        example: "Trial",
    })
    @IsString({ message: "Must be a string" })
    public readonly licenseType: string;

    @ApiProperty({
        type: Date,
        description: "License key expiration date",
        example: {
            isoDate: "2022-05-11",
            isoDateTime: "2022-05-11T10:30:28.236Z",
            timestamp: 1652265028236,
        },
    })
    @Type(() => Date)
    @Transform(({ value }) => {
        const date = new Date(value);
        return isValidDate(date) ? date : null;
    })
    @IsDate({ message: "Must be a correct date type" })
    public readonly expiryDate: Date;
}
