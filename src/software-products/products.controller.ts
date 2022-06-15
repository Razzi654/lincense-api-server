import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from "@nestjs/common";
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
} from "@nestjs/swagger";
import { SuccessResponse } from "src/util-classes/success-response.util";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SoftwareProduct } from "./models/products.model";
import { AffectedProducts, ProductsService } from "./products.service";

@ApiBearerAuth()
@ApiTags("Software products")
@Controller("software_products")
export class ProductsController {
    public constructor(private readonly productsService: ProductsService) {}

    @ApiOperation({ summary: "Get list of all products" })
    @ApiOkResponse({ type: [SoftwareProduct] })
    @Get()
    public findAll() {
        return this.productsService.getProducts();
    }

    @ApiOperation({ summary: "Add a new product" })
    @ApiCreatedResponse({
        type: SoftwareProduct,
        description: "The record has been successfully created",
    })
    @Post()
    public create(@Headers("Authorization") auth: string, @Body() dto: CreateProductDto) {
        return this.productsService.createProduct(auth, dto);
    }

    @ApiOperation({ summary: "Get a particular product by id" })
    @ApiOkResponse({ type: SoftwareProduct })
    @Get(":id")
    public findOne(@Param("id") id: string) {
        return this.productsService.getProduct(id);
    }

    @ApiOperation({ summary: "Update a particular product by id" })
    @ApiOkResponse({ type: SoftwareProduct })
    @Patch(":id")
    public update(@Headers("Authorization") auth: string, @Param("id") id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.updateProduct(auth, id, dto);
    }

    @ApiOperation({ summary: "Delete a particular product by id" })
    @ApiOkResponse({ type: SoftwareProduct })
    @Delete(":id")
    public remove(@Headers("Authorization") auth: string, @Param("id") id: string) {
        return this.productsService.removeProduct(auth, id);
    }
}
