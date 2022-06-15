import { HttpStatus } from "@nestjs/common";

//#region Dependency interfaces
export interface CreateKeyDto {
    readonly productId: string;
    readonly holderName: string;
    readonly email: string;
    readonly licenseType: string;
    readonly expiryDate: string | number | Date;
}

export interface GetKeyDto {
    readonly id: string;
    readonly key_token: string;
}
//#endregion

//#region Common
export interface HttpError {
    statusCode: HttpStatus;
    error: string;
    message: string[];
}

export interface JwtPayload {
    accountId: string;
}

export interface AccessToken {
    accessToken: string;
}
//#endregion
