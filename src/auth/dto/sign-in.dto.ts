import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { isEmail, IsEmail, IsString, MinLength } from "class-validator";
import { ExceptionResponse } from "src/util-classes/exception-response.util";

const minPwdLength = 6;

export class SignInDto {
    @ApiProperty({ description: "Purchaser personal e-mail", example: "user@mail.com" })
    @IsString({ message: "Must be a string" })
    @IsEmail({}, { message: "Incorrect e-mail" })
    public readonly personalEmail: string;

    @ApiProperty({ description: "Account password", example: "qwerty123" })
    @Transform(({ key, value }) => {
        if (isEmail(value)) {
            throw ExceptionResponse.badRequest("Do not use e-mails as password", key);
        }
        return String(value);
    })
    @MinLength(minPwdLength, {
        message: `Password must be at least ${minPwdLength} characters long`,
    })
    public readonly password: string;
}
