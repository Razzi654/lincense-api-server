import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Purchaser } from "./models/purchasers.model";
import { CreatePurchaserDto } from "./dto/create-purchaser.dto";
import { UpdatePurchaserDto } from "./dto/update-purchaser.dto";
import { FindOptions, WhereOptions } from "sequelize";
import { AffectedRows } from "src/utils/types";
import { AuthService } from "src/auth/auth.service";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "src/utils/interfaces";
import { ExceptionResponse } from "src/util-classes/exception-response.util";
import { SuccessResponse } from "src/util-classes/success-response.util";

export type AffectedPurchasers = AffectedRows<Purchaser>;

@Injectable()
export class PurchasersService {
    public constructor(
        @InjectModel(Purchaser) private readonly purchaserRepository: typeof Purchaser,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService
    ) {}

    public async getPurchasers(): Promise<SuccessResponse<Purchaser[]>> {
        const purchasers = await this.purchaserRepository.findAll({
            include: { all: true },
        });
        return SuccessResponse.ok(purchasers);
    }

    public async getPurchaser(
        id: string,
        all: boolean = true
    ): Promise<SuccessResponse<Purchaser>> {
        const options: Omit<FindOptions<Purchaser>, "where"> = all
            ? { include: { all: true } }
            : void 0;
        const purchaser = await this.purchaserRepository.findByPk(id, options);
        return SuccessResponse.ok(purchaser);
    }

    public async createPurchaser(dto: CreatePurchaserDto): Promise<SuccessResponse<Purchaser>> {
        const purchaser = await this.purchaserRepository.create(dto, {
            include: { all: true },
        });
        return SuccessResponse.created(purchaser);
    }

    public async updatePurchaser(
        id: string,
        dto: UpdatePurchaserDto
    ): Promise<SuccessResponse<AffectedPurchasers>> {
        const affectedRows = await this.purchaserRepository.update(dto, {
            where: { id },
            returning: true,
        });
        return SuccessResponse.ok(affectedRows);
    }

    public async removePurchaser(
        auth: string,
        id: string
    ): Promise<SuccessResponse<AffectedPurchasers>> {
        await this.validateFromAuthHeader(auth, id);

        await this.authService.deleteAccountByPurchaserId(id);

        const { response: deleted } = await this.getPurchaser(id, false);
        const affectedRows = await this.purchaserRepository
            .destroy({
                where: { id },
            })
            .catch((e) => {
                throw ExceptionResponse.badRequest("Unable to delete purchaser");
            });
        return SuccessResponse.ok([affectedRows, [deleted]]);
    }

    public async getPurchaserByEmail(email: string, isCorporate?: boolean): Promise<Purchaser> {
        const whereClause: WhereOptions<Purchaser> = isCorporate
            ? { corporateEmail: email }
            : { personalEmail: email };
        const purchaser = await this.purchaserRepository.findOne({
            where: whereClause,
            include: { all: true },
        });
        return purchaser;
    }

    public async purchaserExists(personalEmail: string): Promise<boolean> {
        const purchaser = await this.getPurchaserByEmail(personalEmail);
        return !!purchaser;
    }

    private async validateFromAuthHeader(auth: string, purchaserId: string) {
        const [, bearerToken] = auth.split(" ");

        const decoded: JwtPayload = this.jwtService.decode(bearerToken) as JwtPayload;
        const { accountId } = decoded;

        const account = await this.authService.findAccountById(accountId);
        const { purchaser } = account;

        if (!purchaser || purchaserId !== purchaser.id) {
            ExceptionResponse.badRequest("Invalid auth token");
        }
    }
}
