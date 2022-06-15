// Common imports
import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";

// Licenses module imports
import { LicenseKeysController } from "./license-keys.controller";
import { LicenseKey } from "./models/license-keys.model";
import { LicenseKeysService } from "./license-keys.service";

import { PurchasersModule } from "src/license-keys-purchasers/purchasers.module";
import { ProductsModule } from "src/software-products/products.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        SequelizeModule.forFeature([LicenseKey]),
        forwardRef(() => PurchasersModule),
        HttpModule,
        ProductsModule,
        AuthModule,
    ],
    controllers: [LicenseKeysController],
    providers: [LicenseKeysService],
    exports: [LicenseKeysService],
})
export class LicenseKeysModule {}
