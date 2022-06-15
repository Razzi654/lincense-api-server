import { PartialType } from "@nestjs/swagger";
import { CreatePurchaserDto } from "./create-purchaser.dto";

export class UpdatePurchaserDto extends PartialType(CreatePurchaserDto) {}
