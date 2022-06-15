import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import { AuthService } from "src/auth/auth.service";
import { ExceptionResponse } from "src/util-classes/exception-response.util";
import { SuccessResponse } from "src/util-classes/success-response.util";
import { JwtPayload } from "src/utils/interfaces";
import { AffectedRows } from "src/utils/types";

import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SoftwareProduct } from "./models/products.model";

export type AffectedProducts = AffectedRows<SoftwareProduct>;

@Injectable()
export class ProductsService {
    public constructor(
        @InjectModel(SoftwareProduct) private readonly productsRepository: typeof SoftwareProduct,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService
    ) {}

    public async getProducts(): Promise<SuccessResponse<SoftwareProduct[]>> {
        const products = await this.productsRepository.findAll({
            include: { all: true },
        });
        return SuccessResponse.ok(products);
    }

    public async getProduct(id: string): Promise<SuccessResponse<SoftwareProduct>> {
        const product = await this.productsRepository.findByPk(id, {
            include: { all: true },
        });
        return SuccessResponse.ok(product);
    }

    public async createProduct(auth: string, dto: CreateProductDto): Promise<SuccessResponse<SoftwareProduct>> {
        this.authService.validateAdminFromHeader(auth);
        const product = await this.productsRepository.create(dto, {
            include: { all: true },
        });
        return SuccessResponse.created(product);
    }

    public async updateProduct(
        auth: string,
        id: string,
        dto: UpdateProductDto
    ): Promise<SuccessResponse<AffectedProducts>> {
        this.authService.validateAdminFromHeader(auth);

        const affectedRows = await this.productsRepository.update(dto, {
            where: { id },
            returning: true,
        });
        return SuccessResponse.ok(affectedRows);
    }

    public async removeProduct(
        auth: string,
        id: string
    ): Promise<SuccessResponse<AffectedProducts>> {
        this.authService.validateAdminFromHeader(auth);

        const { response: deleted } = await this.getProduct(id);
        const affectedRows = await this.productsRepository
            .destroy({
                where: { id },
            }).catch((e) => {
                throw ExceptionResponse.badRequest("Unable to delete product");
            });

        return SuccessResponse.ok([affectedRows, [deleted]]);
    }
}
