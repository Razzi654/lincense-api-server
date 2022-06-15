import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsPhoneNumber, IsString, ValidateIf } from "class-validator";

export class CreatePurchaserDto {
    @ApiProperty({ description: "Purchaser first name", example: "John" })
    @IsString({ message: "Must be a string" })
    public readonly firstname: string;

    @ApiProperty({ description: "Purchaser middle name", example: "Fitzgerald" })
    @IsString({ message: "Must be a string" })
    public readonly middlename: string;

    @ApiPropertyOptional({ description: "Purchaser last name", example: "Kennedy" })
    @IsString({ message: "Must be a string" })
    public readonly lastname: string;

    @ApiProperty({ description: "Purchaser personal e-mail", example: "user@mail.com" })
    @IsString({ message: "Must be a string" })
    @IsEmail({}, { message: "Incorrect e-mail" })
    public readonly personalEmail: string;

    @ApiPropertyOptional({
        description: "Purchaser personal phone",
        example: ["+71234567890", "8 123 456 7890"],
    })
    @ValidateIf((_, value) => !!value)
    @IsString({ message: "Must be a string" })
    @IsPhoneNumber(null, { message: "Incorrect phone number" })
    public readonly personalPhone?: string;

    @ApiPropertyOptional({ description: "The company name where the purchaser works" })
    @ValidateIf((_, value) => !!value)
    @IsString({ message: "Must be a string" })
    public readonly company?: string;

    @ApiPropertyOptional({
        description: "Purchaser corporate e-mail",
        example: "company.name@companysite.org",
    })
    @ValidateIf((_, value) => !!value)
    @IsString({ message: "Must be a string" })
    @IsEmail({}, { message: "Incorrect e-mail" })
    public readonly corporateEmail?: string;

    @ApiPropertyOptional({
        description: "Purchaser corporate phone",
        example: ["81234567890", "8 123 456 7890"],
    })
    @ValidateIf((_, value) => !!value)
    @IsString({ message: "Must be a string" })
    @IsPhoneNumber(null, { message: "Incorrect phone number" })
    public readonly corporatePhone?: string;

    @ApiPropertyOptional({
        description: "Field of activity of the company",
        example: "Equipment and supplies for barber and beauty shops",
    })
    @ValidateIf((_, value) => !!value)
    @IsString({ message: "Must be a string" })
    public readonly fieldOfActivity?: string;

    @ApiPropertyOptional({
        description: "Purchaser position in the company",
        example: "Chief marketing officer",
    })
    @ValidateIf((_, value) => !!value)
    @IsString({ message: "Must be a string" })
    public readonly position?: string;
}
