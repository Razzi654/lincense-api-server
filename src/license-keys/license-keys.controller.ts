import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { CreateLicenseKeyDto } from "./dto/create-license-key.dto";
import { LicenseKey } from "./models/license-keys.model";
import { LicenseKeysService } from "./license-keys.service";
import { UpdateLicenseKeyDto } from "./dto/update-license-key.dto";

@ApiBearerAuth()
@ApiTags("Software license keys")
@Controller("licenses")
export class LicenseKeysController {
    public constructor(private readonly licenseKeysService: LicenseKeysService) {}

    @ApiOperation({ summary: "Get all licenses" })
    @ApiOkResponse({ type: [LicenseKey] })
    @Get()
    public findAll(@Headers("Authorization") auth: string) {
        return this.licenseKeysService.getLicenses(auth);
    }

    @ApiOperation({ summary: "Add a new license" })
    @ApiCreatedResponse({
        description: "The record has been successfully created",
    })
    @Post()
    public create(@Headers("Authorization") auth: string, @Body() dto: CreateLicenseKeyDto) {
        return this.licenseKeysService.createLicense(auth, dto);
    }

    @ApiOperation({ summary: "Update a particular license information (not license key) by id" })
    @Patch(":id")
    public update(
        @Headers("Authorization") auth: string,
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateLicenseKeyDto
    ) {
        return this.licenseKeysService.updateLicense(auth, id, dto);
    }

    @ApiOperation({ summary: "Get a particular license by id" })
    @ApiOkResponse({ type: LicenseKey })
    @Get(":id")
    public findOne(@Headers("Authorization") auth: string, @Param("id", ParseUUIDPipe) id: string) {
        return this.licenseKeysService.getLicense(auth, id);
    }
}
