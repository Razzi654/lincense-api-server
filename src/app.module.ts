import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { SequelizeModule } from "@nestjs/sequelize";
import { PurchasersModule } from "./license-keys-purchasers/purchasers.module";
import { LicenseKeysModule } from "./license-keys/license-keys.module";
import { ProductsModule } from "./software-products/products.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { getEnvConfig, getDbConfig } from "./utils/functions";

@Module({
    imports: [
        ConfigModule.forRoot(getEnvConfig()),
        SequelizeModule.forRoot(getDbConfig()),
        ScheduleModule.forRoot(),
        AuthModule,
        PurchasersModule,
        LicenseKeysModule,
        ProductsModule,
    ],
    controllers: [],
    providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
