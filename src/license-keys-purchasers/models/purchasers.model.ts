import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { LicenseKey } from "src/license-keys/models/license-keys.model";
import { getDefaultTableOptions } from "src/utils/functions";

interface PurchaserCreationAttrs {
    firstname: string;
    middlename: string;
    lastname?: string;
    personalEmail: string;
    personalPhone?: string;
    company?: string;
    corporateEmail?: string;
    corporatePhone?: string;
    fieldOfActivity?: string;
    position?: string;
}

@Table(getDefaultTableOptions("license_keys_purchasers"))
export class Purchaser extends Model<Purchaser, PurchaserCreationAttrs> {
    @Column({
        type: DataType.UUID,
        unique: true,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    public id: string;

    @ApiProperty({ description: "Purchaser first name", example: "John" })
    @Column({ type: DataType.TEXT, allowNull: false })
    public firstname: string;

    @ApiProperty({ description: "Purchaser middle name", example: "Fitzgerald" })
    @Column({ type: DataType.TEXT, allowNull: false })
    public middlename: string;

    @ApiPropertyOptional({ description: "Purchaser last name", example: "Kennedy" })
    @Column({ type: DataType.TEXT, allowNull: true })
    public lastname: string;

    @ApiProperty({ description: "Purchaser personal e-mail", example: "user@mail.com" })
    @Column({ type: DataType.TEXT, unique: true, allowNull: false, field: "personal_email" })
    public personalEmail: string;

    @ApiPropertyOptional({
        description: "Purchaser personal phone",
        example: ["+71234567890", "8 123 456 7890"],
    })
    @Column({ type: DataType.TEXT, allowNull: true, field: "personal_phone" })
    public personalPhone: string;

    @ApiPropertyOptional({ description: "The company name where the purchaser works" })
    @Column({ type: DataType.TEXT, allowNull: true })
    public company: string;

    @ApiPropertyOptional({
        description: "Purchaser corporate e-mail",
        example: "company.name@companysite.org",
    })
    @Column({ type: DataType.TEXT, allowNull: true, field: "corporate_email" })
    public corporateEmail: string;

    @ApiPropertyOptional({
        description: "Purchaser corporate phone",
        example: ["81234567890", "8 123 456 7890"],
    })
    @Column({ type: DataType.TEXT, allowNull: true, field: "corporate_phone" })
    public corporatePhone: string;

    @ApiPropertyOptional({
        description: "Field of activity of the company",
        example: "Equipment and supplies for barber and beauty shops",
    })
    @Column({ type: DataType.TEXT, allowNull: true, field: "field_of_activity" })
    public fieldOfActivity: string;

    @ApiPropertyOptional({
        description: "Purchaser position in the company",
        example: "Chief marketing officer",
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    public position: string;

    // Associations
    @HasMany(() => LicenseKey, { onDelete: "NO ACTION" })
    public licenseKeys: LicenseKey[];
}
