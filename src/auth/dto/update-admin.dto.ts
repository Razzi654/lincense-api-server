import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateAdminDto {
    @ApiProperty({ description: "Admin first name", example: "John" })
    @IsString({ message: "Must be a string" })
    public readonly firstname: string;

    @ApiProperty({ description: "Admin middle name", example: "Fitzgerald" })
    @IsString({ message: "Must be a string" })
    public readonly middlename: string;

    @ApiPropertyOptional({ description: "Admin last name", example: "Kennedy" })
    @IsString({ message: "Must be a string" })
    public readonly lastname?: string;

    @ApiProperty({ description: "Admin personal e-mail", example: "user@mail.com" })
    @IsString({ message: "Must be a string" })
    public readonly personalEmail: string;

    @ApiPropertyOptional({
        description: "Admin position in the company",
        example: "Chief marketing officer",
    })
    @IsString({ message: "Must be a string" })
    public readonly position?: string;
}
