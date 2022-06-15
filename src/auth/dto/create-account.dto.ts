import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { MinLength } from "class-validator";
import { CreatePurchaserDto } from "src/license-keys-purchasers/dto/create-purchaser.dto";

export class CreateAccountDto extends CreatePurchaserDto {
    @ApiProperty({ description: "Account password", example: "qwerty123" })
    @Transform(({ value }) => String(value))
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    public readonly password: string;
}
