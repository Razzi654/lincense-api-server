import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcrypt";
import { PurchasersService } from "src/license-keys-purchasers/purchasers.service";
import { ExceptionResponse } from "src/util-classes/exception-response.util";
import { SuccessResponse } from "src/util-classes/success-response.util";
import { CreateAccountDto } from "./dto/create-account.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { AuthAccount } from "./models/auth.model";
import { addProperty } from "src/utils/functions";
import { AccessToken, JwtPayload } from "src/utils/interfaces";
import { Purchaser } from "src/license-keys-purchasers/models/purchasers.model";
import { Utils } from "sequelize";
import { AdmAccount } from "./models/admin.model";
import { UpdateAdminDto } from "./dto/update-admin.dto";

const saltRounds = 10;

@Injectable()
export class AuthService {
    public constructor(
        @InjectModel(AdmAccount) private readonly admRepository: typeof AdmAccount,
        @InjectModel(AuthAccount) private readonly authRepository: typeof AuthAccount,
        @Inject(forwardRef(() => PurchasersService))
        private readonly purchasersService: PurchasersService,
        private readonly jwtService: JwtService
    ) {
        this.admRepository.findOne().then((acc) => {
            if (!acc) {
                bcrypt.hash("default_admin_passwd", saltRounds).then((pass) => {
                    this.admRepository.create({
                        firstname: "Admin firstname",
                        middlename: "Admin firstname",
                        lastname: "",
                        personalEmail: "admin@email.com",
                        position: "",
                        password: pass,
                    });
                });
            }
        });
    }

    public async signIn(
        dto: SignInDto
    ): Promise<
        SuccessResponse<AccessToken & AuthAccount> | SuccessResponse<AccessToken & AdmAccount>
    > {
        const adm = await this.validateAdmAccount(dto);

        if (adm) {
            const { id } = adm;
            const accessToken = await this.generateToken(id);
            const accountClone = Utils.cloneDeep(adm.toJSON());
            delete accountClone.password;
            return SuccessResponse.ok(addProperty(accessToken, accountClone));
        }

        const account = await this.validateAccount(dto);
        const { id } = account;
        const accessToken = await this.generateToken(id);
        const accountClone = Utils.cloneDeep(account.toJSON());
        delete accountClone.password;
        delete accountClone.purchaserId;
        return SuccessResponse.ok(addProperty(accessToken, accountClone));
    }

    public async signUp(dto: CreateAccountDto): Promise<SuccessResponse<AccessToken>> {
        const { personalEmail } = dto;

        const purchaserExists = await this.purchasersService.purchaserExists(personalEmail);

        if (purchaserExists) {
            throw ExceptionResponse.badRequest(
                "The specified personal email address is already registered",
                "sign-up"
            );
        }

        const { password } = dto;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        addProperty(dto, { password: hashPassword });

        const { response: purchaser } = await this.purchasersService.createPurchaser(dto);
        const account = await this.authRepository.create(
            { password: hashPassword, purchaserId: purchaser.id },
            { returning: true }
        );

        const { id } = account;
        const token = await this.generateToken(id);

        return SuccessResponse.ok(token);
    }

    public async validateJwtPayload({
        accountId,
    }: JwtPayload): Promise<SuccessResponse<Purchaser | AdmAccount>> {
        if (this.isAdmin(accountId)) {
            const admAccount = await this.admRepository.findByPk(accountId);

            if (admAccount) {
                return SuccessResponse.ok(admAccount);
            } else {
                throw ExceptionResponse.unauthorized("Incorrect auth token");
            }
        }

        const account = await this.findAccountById(accountId);

        if (!account) {
            throw ExceptionResponse.unauthorized("Incorrect auth token");
        }

        const { purchaser } = account;

        return SuccessResponse.ok(purchaser);
    }

    public async validateAccount({ personalEmail, password }: SignInDto): Promise<AuthAccount> {
        const purchaser = await this.purchasersService.getPurchaserByEmail(personalEmail);

        if (!purchaser) {
            throw ExceptionResponse.unauthorized("Incorrect e-mail or password", "sign-in");
        }

        const { id: purchaserId } = purchaser;
        const account = await this.findAccountByPurchaserId(purchaserId);

        const { password: purchaserPasswd } = account;
        const passwordEquals = await bcrypt.compare(password, purchaserPasswd);

        if (!passwordEquals) {
            throw ExceptionResponse.unauthorized("Incorrect e-mail or password", "sign-in");
        }

        return account;
    }

    public async findAccountByPurchaserId(id: string): Promise<AuthAccount> {
        const account = await this.authRepository.findOne({
            where: { purchaserId: id },
            include: { all: true },
        });
        return account;
    }

    public async deleteAccountByPurchaserId(id: string): Promise<number> {
        return this.authRepository.destroy({ where: { purchaserId: id } });
    }

    public async findAccountById(id: string): Promise<AuthAccount> {
        const account = await this.authRepository.findByPk(id, { include: { all: true } });
        return account;
    }

    public async updateAdminAccount(authHeader: string, dto: UpdateAdminDto) {
        try {
            const [, bearerToken] = authHeader.split(" ");
            const decodedToken: JwtPayload = this.jwtService.decode(bearerToken) as JwtPayload;

            if (!decodedToken) {
                throw ExceptionResponse.badRequest("Unadle to decode auth token");
            }

            const { accountId } = decodedToken;

            if (!accountId) {
                throw ExceptionResponse.badRequest("Incorrect auth token");
            }

            const admAccount = await this.admRepository.findByPk(accountId);

            if (!admAccount || accountId !== admAccount.id) {
                throw ExceptionResponse.badRequest("Incorrect auth token");
            }

            const { id } = admAccount;

            const [, affectedRows] = await this.admRepository.update(dto, {
                where: { id },
                returning: true,
            });
            const [acc] = affectedRows;
            const accountClone = Utils.cloneDeep(acc.toJSON());
            delete accountClone.password;

            return SuccessResponse.ok(accountClone);
        } catch (error) {
            throw error;
        }
    }

    public async getAdminAccount(authHeader: string) {
        this.validateAdminFromHeader(authHeader);
        return SuccessResponse.ok(await this.admRepository.findAll());
    }

    public async updatePassword(
        authHeader: string,
        id: string,
        { oldPassword, newPassword }: UpdatePasswordDto
    ) {
        try {
            const [, bearerToken] = authHeader.split(" ");
            const decodedToken: JwtPayload = this.jwtService.decode(bearerToken) as JwtPayload;

            if (!decodedToken) {
                throw ExceptionResponse.badRequest("Unadle to decode auth token", "updatePassword");
            }

            const { accountId } = decodedToken;

            if (!accountId) {
                throw ExceptionResponse.badRequest("Incorrect auth token", "updatePassword");
            }

            const adm = await this.admRepository.findByPk(accountId);

            if (adm) {
                const { personalEmail } = adm;

                const validated = await this.validateAdmAccount({
                    personalEmail: personalEmail,
                    password: oldPassword,
                });
                if (!validated) {
                    throw ExceptionResponse.badRequest("Incorrect old password", "updatePassword");
                }

                const hashPassword = await bcrypt.hash(newPassword, saltRounds);
                await this.admRepository.update(
                    { password: hashPassword },
                    { where: { id: accountId } }
                );
                return SuccessResponse.ok("Password has been successfully updated");
            }

            if (accountId !== id) {
                throw ExceptionResponse.badRequest("Incorrect auth token", "updatePassword");
            }

            const { purchaser } = await this.authRepository.findByPk(accountId, {
                include: { all: true },
            });
            const { personalEmail } = purchaser;

            const validated = await this.validateAccount({
                personalEmail: personalEmail,
                password: oldPassword,
            });
            if (!validated) {
                throw ExceptionResponse.badRequest("Incorrect old password", "updatePassword");
            }

            const hashPassword = await bcrypt.hash(newPassword, saltRounds);

            await this.authRepository.update(
                { password: hashPassword },
                { where: { id }, returning: true }
            );

            return SuccessResponse.ok("Password has been successfully updated");
        } catch (error) {
            throw error;
        }
    }

    public validateAdminFromHeader(authHeader: string) {
        const [, bearerToken] = authHeader.split(" ");
        const decodedToken: JwtPayload = this.jwtService.decode(bearerToken) as JwtPayload;

        if (!decodedToken) {
            throw ExceptionResponse.badRequest("Unadle to decode auth token");
        }

        const { accountId } = decodedToken;

        if (!accountId) {
            throw ExceptionResponse.badRequest("Incorrect auth token");
        }

        if (!this.isAdmin(accountId)) {
            throw ExceptionResponse.badRequest("You are not an admin");
        }
    }

    private isAdmin(id: string): boolean {
        return id.startsWith("A_");
    }

    private async generateToken(id: string): Promise<AccessToken> {
        const payload: JwtPayload = { accountId: id };
        return { accessToken: this.jwtService.sign(payload) };
    }

    private async getAdminAccountByEmail(email: string): Promise<AdmAccount> {
        const adm = await this.admRepository.findOne({
            where: { personalEmail: email },
            include: { all: true },
        });
        return adm;
    }

    private async validateAdmAccount({ personalEmail, password }: SignInDto): Promise<AdmAccount> {
        const adm = await this.getAdminAccountByEmail(personalEmail);

        if (adm) {
            const { password: admPass } = adm;
            const passwordEquals = await bcrypt.compare(password, admPass);

            if (passwordEquals) {
                return adm;
            }
        }

        return null;
    }
}
