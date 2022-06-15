import {
    BadRequestException,
    HttpException,
    HttpStatus,
    NotFoundException,
    UnauthorizedException,
    ValidationError,
} from "@nestjs/common";
import { ErrorMessage } from "src/utils/types";

export class ExceptionResponse {
    private static readonly defaultKey = "error";

    public readonly status: HttpStatus;
    public readonly message: string;
    public readonly response: Record<string, any>[];

    private constructor(exception: ExceptionResponse) {
        Object.assign(this, exception);
    }

    public static badRequest(
        error: ErrorMessage,
        property: string = this.defaultKey
    ): HttpException {
        return new BadRequestException(
            this.responseObject(HttpStatus.BAD_REQUEST, error, property)
        );
    }

    public static notFound(error: ErrorMessage, property: string = this.defaultKey): HttpException {
        return new NotFoundException(this.responseObject(HttpStatus.NOT_FOUND, error, property));
    }

    public static unauthorized(
        error: ErrorMessage,
        property: string = this.defaultKey
    ): HttpException {
        return new UnauthorizedException(
            this.responseObject(HttpStatus.UNAUTHORIZED, error, property)
        );
    }

    private static errorMessage(property: string, error: ErrorMessage): Record<string, any>[] {
        return Array.isArray(error)
            ? this.formatValidationErrors(error)
            : [{ property: property, constraints: [error] }];
    }

    private static formatValidationErrors(errors: ValidationError[]): Record<string, any>[] {
        return errors.map(({ property, constraints }) => {
            return { property: property, constraints: Object.values(constraints) };
        });
    }

    private static responseObject(
        status: HttpStatus,
        message: ErrorMessage,
        property?: string
    ): ExceptionResponse {
        return new ExceptionResponse({
            status: status,
            message: HttpStatus[status].split("_").join(" "),
            response: this.errorMessage(property, message),
        });
    }
}
