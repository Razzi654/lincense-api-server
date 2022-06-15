import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { LicenseKey } from "src/license-keys/models/license-keys.model";
import { getDefaultTableOptions } from "src/utils/functions";

interface SoftwareProductCreationAttrs {
    vendor: string;
    project_area?: string;
    project_type?: string;
    productName: string;
    description?: string;
}

@Table(getDefaultTableOptions("software_products"))
export class SoftwareProduct extends Model<SoftwareProduct, SoftwareProductCreationAttrs> {
    @Column({
        type: DataType.TEXT,
        unique: true,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    public id: string;

    @ApiProperty({
        description: "Product vendor name",
    })
    @Column({ type: DataType.TEXT, unique: false, allowNull: false })
    public vendor: string;

    @ApiPropertyOptional({
        description: "Product area",
        example: "Microsoft Power BI",
    })
    @Column({ type: DataType.TEXT, unique: false, allowNull: true, field: "product_area" })
    public productArea: string;

    @ApiPropertyOptional({
        description: "Product type depending on the product area",
        example: "Power BI Custom Visual",
    })
    @Column({ type: DataType.TEXT, unique: false, allowNull: true, field: "product_type" })
    public productType: string;

    @ApiProperty({
        description: "Product name",
    })
    @Column({ type: DataType.TEXT, unique: false, allowNull: false, field: "product_name" })
    public productName: string;

    @ApiPropertyOptional({
        description: "Product description",
    })
    @Column({ type: DataType.TEXT, unique: false, allowNull: true })
    public description: string;

    // Associations
    @HasMany(() => LicenseKey, { onDelete: "NO ACTION" })
    public licenseKeys: LicenseKey[];
}
