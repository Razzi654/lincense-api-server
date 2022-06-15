import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PurchasersModule } from "src/license-keys-purchasers/purchasers.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { AuthAccount } from "./models/auth.model";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./passport-strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AdmAccount } from "./models/admin.model";

const jwtOptions = (config: ConfigService): JwtModuleOptions => ({
    secret: config.get("JWT_SECRET"),
    signOptions: { algorithm: "HS512", expiresIn: config.get("JWT_EXPIRES_IN") },
});

@Module({
    imports: [
        SequelizeModule.forFeature([AuthAccount, AdmAccount]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: jwtOptions,
        }),
        forwardRef(() => PurchasersModule),
        PassportModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule {}
