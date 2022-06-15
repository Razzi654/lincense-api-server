import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import * as sequelize from "sequelize";
import { Column, DataType, Model, Table } from "sequelize-typescript";

interface AdmCreationAttrs {
    firstname: string;
    middlename: string;
    lastname?: string;
    personalEmail: string;
    position?: string;
    password: string;
}

@Table({
    tableName: "adm_accounts",
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
})
export class AdmAccount extends Model<AdmAccount, AdmCreationAttrs> {
    @Column({
        type: DataType.TEXT,
        unique: true,
        primaryKey: true,
        allowNull: false,
        defaultValue: sequelize.fn("concat", "A_", sequelize.fn("gen_random_uuid")),
    })
    public id: string;

    @ApiProperty({ description: "Admin first name", example: "John" })
    @Column({ type: DataType.TEXT, allowNull: false })
    public firstname: string;

    @ApiProperty({ description: "Admin middle name", example: "Fitzgerald" })
    @Column({ type: DataType.TEXT, allowNull: false })
    public middlename: string;

    @ApiPropertyOptional({ description: "Admin last name", example: "Kennedy" })
    @Column({ type: DataType.TEXT, allowNull: true })
    public lastname: string;

    @ApiProperty({ description: "Admin personal e-mail", example: "user@mail.com" })
    @Column({ type: DataType.TEXT, unique: true, allowNull: false, field: "personal_email" })
    public personalEmail: string;

    @ApiPropertyOptional({
        description: "Admin position in the company",
        example: "Chief marketing officer",
    })
    @Column({ type: DataType.TEXT, allowNull: true })
    public position: string;

    @ApiProperty({
        type: DataType.TEXT,
        description: "Admin password hash",
        example: "$2a$10$/zLIwRq0nSfGUCnalaesLetiJcO2NJA5N3qrdf1V3J7coGxWlhyU2",
    })
    @Column({ type: DataType.TEXT, unique: false, allowNull: false })
    public password: string;
}
