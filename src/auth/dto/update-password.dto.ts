import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { MinLength } from "class-validator";

export class UpdatePasswordDto {
    @ApiProperty({ description: "Account old password", example: "qwerty123" })
    @Transform(({ value }) => String(value))
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    public readonly oldPassword: string;

    @ApiProperty({ description: "Account new password", example: "qwerty123456" })
    @Transform(({ value }) => String(value))
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    public readonly newPassword: string;
}
