import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Param,
    ParseUUIDPipe,
    Patch,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Purchaser } from "./models/purchasers.model";
import { PurchasersService } from "./purchasers.service";
import { UpdatePurchaserDto } from "./dto/update-purchaser.dto";

@ApiBearerAuth()
@ApiTags("License keys purchasers")
@Controller("purchasers")
export class PurchasersController {
    public constructor(private readonly purchasersService: PurchasersService) {}

    @ApiOperation({ summary: "Get list of purchasers" })
    @ApiOkResponse({ type: [Purchaser] })
    @Get()
    public findAll() {
        return this.purchasersService.getPurchasers();
    }

    @ApiOperation({ summary: "Get a particular purchaser by id" })
    @ApiOkResponse({ type: Purchaser })
    @Get(":id")
    public findOne(@Param("id", ParseUUIDPipe) id: string) {
        return this.purchasersService.getPurchaser(id);
    }

    @ApiOperation({ summary: "Update a particular purchaser by id" })
    @Patch(":id")
    public update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdatePurchaserDto) {
        return this.purchasersService.updatePurchaser(id, dto);
    }

    @ApiOperation({ summary: "Delete a particular purchaser by id" })
    @Delete(":id")
    public remove(@Headers("Authorization") auth: string, @Param("id", ParseUUIDPipe) id: string) {
        return this.purchasersService.removePurchaser(auth, id);
    }
}
