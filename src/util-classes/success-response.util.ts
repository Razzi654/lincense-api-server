import { HttpStatus } from "@nestjs/common";

export class SuccessResponse<T> {
    public readonly status: HttpStatus;
    public readonly message: string;
    public readonly response: T;

    private constructor(success: SuccessResponse<any>) {
        Object.assign(this, success);
    }

    public static ok<T>(response: T): SuccessResponse<T> {
        return this.responseObject(HttpStatus.OK, response);
    }

    public static created<T>(response: T): SuccessResponse<T> {
        return this.responseObject(HttpStatus.CREATED, response);
    }

    private static responseObject<T>(status: HttpStatus, response: T): SuccessResponse<T> {
        return new SuccessResponse<T>({
            status: status,
            message: HttpStatus[status].split("_").join(" "),
            response: response,
        });
    }
}
