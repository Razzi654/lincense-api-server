import { HttpService } from "@nestjs/axios";
import { forwardRef, HttpException, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { firstValueFrom } from "rxjs";

import { CreateLicenseKeyDto } from "./dto/create-license-key.dto";
import { LicenseKey } from "./models/license-keys.model";
import { ProductsService } from "src/software-products/products.service";
import { PurchasersService } from "src/license-keys-purchasers/purchasers.service";
import { AxiosError, AxiosResponse } from "axios";

import {
    addProperty,
    getLicenseGenBaseUrl,
    isObject,
    stringifyProperties,
} from "src/utils/functions";
import { GetKeyDto, HttpError, CreateKeyDto, JwtPayload } from "src/utils/interfaces";
import { AffectedRows } from "src/utils/types";
import { Cron, CronExpression } from "@nestjs/schedule";
import { fn, Op } from "sequelize";
import { ExceptionResponse } from "src/util-classes/exception-response.util";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "src/auth/auth.service";
import { SuccessResponse } from "src/util-classes/success-response.util";
import { UpdateLicenseKeyDto } from "./dto/update-license-key.dto";

type AffectedLicenseKeys = AffectedRows<LicenseKey>;
type KeyResponse = AxiosResponse<GetKeyDto>;
type KeysResponse = AxiosResponse<GetKeyDto[]>;
type ExtendedLicenseKey = LicenseKey & { license_key?: GetKeyDto };

@Injectable()
export class LicenseKeysService {
    private readonly licenseGeneratorUrl: string;

    public constructor(
        @InjectModel(LicenseKey) private readonly licenseKeyRepository: typeof LicenseKey,
        @Inject(forwardRef(() => PurchasersService))
        private readonly purchaserService: PurchasersService,
        private readonly productsService: ProductsService,
        private readonly httpService: HttpService,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService
    ) {
        this.licenseGeneratorUrl = getLicenseGenBaseUrl();
    }

    public async getLicenses(authHeader: string): Promise<SuccessResponse<LicenseKey[]>> {
        this.authService.validateAdminFromHeader(authHeader);

        const licenses = await this.licenseKeyRepository.findAll({
            include: { all: true },
        });

        const { data: keys } = await this.getLicenseKeys(authHeader);

        return SuccessResponse.ok(
            licenses.map((license, i) => this.mergeLicenseKey(license, keys && keys[i]))
        );
    }

    public async getLicense(authHeader: string, id: string): Promise<SuccessResponse<LicenseKey>> {
        this.authService.validateAdminFromHeader(authHeader);
        const license = await this.licenseKeyRepository.findByPk(id, {
            include: { all: true },
        });

        const { licenseKeyId } = license;
        const { data: key } = await this.getLicenseKey(authHeader, licenseKeyId);

        return SuccessResponse.ok(this.mergeLicenseKey(license, key));
    }

    public async updateLicense(authHeader: string, id: string, dto: UpdateLicenseKeyDto) {
        this.authService.validateAdminFromHeader(authHeader);
        const affectedRows = await this.licenseKeyRepository.update(dto, {
            where: { id },
            returning: true,
        });
        return SuccessResponse.ok(affectedRows);
    }

    public async createLicense(
        authHeader: string,
        dto: CreateLicenseKeyDto
    ): Promise<SuccessResponse<LicenseKey>> {
        const { purchaserId, productId } = dto;

        const { response: client } = await this.purchaserService.getPurchaser(purchaserId);

        if (!client) {
            throw ExceptionResponse.badRequest("Purchaser not found");
        }

        const { response: product } = await this.productsService.getProduct(productId);

        if (!product) {
            throw ExceptionResponse.badRequest("Product not found");
        }

        const stringifiedDto = stringifyProperties(dto);
        const { licenseType, expiryDate } = stringifiedDto;
        const { firstname, lastname, middlename, personalEmail } = client;

        const createLicenseKeyDto: CreateKeyDto = {
            holderName: `${firstname} ${middlename} ${lastname}`,
            email: personalEmail,
            licenseType: licenseType,
            expiryDate: expiryDate,
            productId: productId,
        };

        const licenseKeyToken = await this.createLicenseKey(authHeader, createLicenseKeyDto);

        const { id: licenseKeyId } = licenseKeyToken;

        addProperty(stringifiedDto, { licenseKeyId });

        const license = await this.licenseKeyRepository.create(stringifiedDto, {
            include: { all: true },
        });

        return SuccessResponse.created(license);
    }

    private mergeLicenseKey(license: LicenseKey, data?: any): ExtendedLicenseKey {
        const dto = license.get({ plain: true, clone: true });

        if (data && !isObject(data)) {
            return dto;
        }

        return addProperty(dto, { license_key_token: data });
    }

    private async getLicenseKeys(authHeader: string): Promise<KeysResponse> {
        const answer = this.httpService.get(this.licenseGeneratorUrl, {
            headers: { Authorization: authHeader },
        });
        return firstValueFrom(answer).catch(({ response }: AxiosError<HttpError>) => {
            const { config, data } = response;
            const { method, url } = config;
            const { statusCode } = data;
            addProperty(data, { request: { method, url } });
            Logger.error(data);
            throw new HttpException(data, statusCode);
        });
    }

    private async getLicenseKey(authHeader: string, licenseKeyId: string): Promise<KeyResponse> {
        const answer = this.httpService.get(this.licenseGeneratorUrl.concat(licenseKeyId), {
            headers: { Authorization: authHeader },
        });
        return firstValueFrom(answer).catch(({ response }: AxiosError<HttpError>) => {
            const { config, data } = response;
            const { method, url } = config;
            const { statusCode } = data;
            addProperty(data, { request: { method, url } });
            Logger.error(data);
            throw new HttpException(data, statusCode);
        });
    }

    private async createLicenseKey(authHeader: string, body: CreateKeyDto): Promise<GetKeyDto> {
        const answer = this.httpService.post(this.licenseGeneratorUrl, body, {
            headers: { Authorization: authHeader },
        });

        const { data: licenseKeyToken } = await firstValueFrom(answer).catch(
            ({ response }: AxiosError<HttpError>) => {
                const { config, data } = response;
                const { method, url } = config;
                const { statusCode } = data;
                addProperty(data, { request: { method, url } });
                Logger.error(data);
                throw new HttpException(data, statusCode);
            }
        );

        return licenseKeyToken;
    }

    private async validateFromAuthHeader(auth: string, licenseKeyId: string): Promise<void> {
        const [, bearerToken] = auth.split(" ");
        const decoded: JwtPayload = this.jwtService.decode(bearerToken) as JwtPayload;
        const { accountId } = decoded;
        const account = await this.authService.findAccountById(accountId);
        const { purchaser } = account;
        if (
            !purchaser ||
            !purchaser.licenseKeys ||
            !purchaser.licenseKeys.some((key) => key.id === licenseKeyId)
        ) {
            ExceptionResponse.badRequest("Invalid auth token");
        }
    }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    private async removeExpiredKeys() {
        const now = new Date().toLocaleString();
        Logger.log(`Removing expired license keys at ${now}.`);
        await this.licenseKeyRepository.destroy({ where: { expiryDate: { [Op.lte]: fn("NOW") } } });
    }
}
