import {
    Controller,
    Post,
    Body,
    Headers,
    Patch,
    Param,
    Put,
    Get,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "src/utils/decorators";
import { AuthService } from "./auth.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";

@ApiTags("Authorization")
@Controller("auth")
export class AuthController {
    public constructor(private readonly authService: AuthService) {}

    @Public()
    @Post("/sign-up")
    public signUp(@Body() dto: CreateAccountDto) {
        return this.authService.signUp(dto);
    }

    @Public()
    @Post("/sign-in")
    public signIn(@Body() dto: SignInDto) {
        return this.authService.signIn(dto);
    }

    @ApiBearerAuth()
    @Patch(":id")
    public updatePassword(
        @Headers("Authorization") auth: string,
        @Param("id") id: string,
        @Body() dto: UpdatePasswordDto
    ) {
        return this.authService.updatePassword(auth, id, dto);
    }

    @ApiBearerAuth()
    @Put("/adm/:id")
    public updateAdminAccount(@Headers("Authorization") auth: string, @Body() dto: UpdateAdminDto) {
        return this.authService.updateAdminAccount(auth, dto);
    }

    @ApiBearerAuth()
    @Get("/adm")
    public getAdminAccount(@Headers("Authorization") auth: string) {
        return this.authService.getAdminAccount(auth);
    }
}
