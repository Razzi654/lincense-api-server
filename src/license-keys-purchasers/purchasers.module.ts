import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PurchasersController } from "./purchasers.controller";
import { Purchaser } from "./models/purchasers.model";
import { PurchasersService } from "./purchasers.service";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [SequelizeModule.forFeature([Purchaser]), AuthModule],
    controllers: [PurchasersController],
    providers: [PurchasersService],
    exports: [PurchasersService],
})
export class PurchasersModule {}
