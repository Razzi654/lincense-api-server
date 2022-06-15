import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ProductsController } from "./products.controller";
import { SoftwareProduct } from "./models/products.model";
import { ProductsService } from "./products.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [SequelizeModule.forFeature([SoftwareProduct]), AuthModule],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule {}
