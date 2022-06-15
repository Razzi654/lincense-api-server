import { ApiProperty } from "@nestjs/swagger";
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Purchaser } from "src/license-keys-purchasers/models/purchasers.model";
import { SoftwareProduct } from "src/software-products/models/products.model";
import { getDefaultTableOptions } from "src/utils/functions";

interface LicenseKeyCreationAttrs {
    productId: string;
    purchaserId: string;
    licenseKeyId: string;
    licenseType: string;
    expiryDate: string;
}

@Table(getDefaultTableOptions("license_keys_info"))
export class LicenseKey extends Model<LicenseKey, LicenseKeyCreationAttrs> {
    @Column({
        type: DataType.UUID,
        unique: true,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    public id: string;

    @ApiProperty({
        type: String,
        description: "Product identifier: UUID, Power BI visual GUID, etc",
        example: {
            uuid: "5f95888a-6519-44bc-a08e-e76dda4621f1",
            visualGuid: "ClusteredStackedBarChart39ECD6FE50G",
        },
    })
    @ForeignKey(() => SoftwareProduct)
    @Column({ type: DataType.TEXT, unique: false, allowNull: false, field: "product_id" })
    public productId: string;

    @ApiProperty({
        type: String,
        description: "Purchaser UUID",
        example: "427826c2-2297-4e15-9995-5c6482e1092d",
    })
    @ForeignKey(() => Purchaser)
    @Column({ type: DataType.UUID, unique: false, allowNull: false, field: "purchaser_id" })
    public purchaserId: string;

    @ApiProperty({
        type: String,
        description: "License key token UUID",
        example: "19fc3efc-9d94-48a5-9a6f-45b8856f46e8",
    })
    @Column({
        type: DataType.UUID,
        unique: false,
        allowNull: false,
        field: "license_key_id",
        comment: "Key token",
    })
    public licenseKeyId: string;

    @ApiProperty({
        type: String,
        description: "License key type",
        example: "Trial",
    })
    @Column({ type: DataType.TEXT, unique: false, allowNull: false, field: "license_type" })
    public licenseType: string;

    @ApiProperty({
        type: Date,
        description: "License key expiration date",
        example: {
            isoDate: "2022-05-11",
            isoDateTime: "2022-05-11T10:30:28.236Z",
            timestamp: 1652265028236,
        },
    })
    @Column({ type: DataType.DATE, unique: false, allowNull: false, field: "expiry_date" })
    public expiryDate: Date;

    // Associations
    @BelongsTo(() => Purchaser)
    public holder: Purchaser;

    @BelongsTo(() => SoftwareProduct)
    public product: SoftwareProduct;
}
