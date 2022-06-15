import { ApiProperty } from "@nestjs/swagger";
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Purchaser } from "src/license-keys-purchasers/models/purchasers.model";

interface AuthCreationAttrs {
    purchaserId: string;
    password: string;
}

@Table({
    tableName: "purchaser_accounts",
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
})
export class AuthAccount extends Model<AuthAccount, AuthCreationAttrs> {
    @Column({
        type: DataType.UUID,
        unique: true,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataType.UUIDV4,
    })
    public id: string;

    @ApiProperty({
        type: DataType.UUID,
        description: "Purchaser UUID",
        example: "427826c2-2297-4e15-9995-5c6482e1092d",
    })
    @ForeignKey(() => Purchaser)
    @Column({ type: DataType.UUID, unique: true, allowNull: false, field: "purchaser_id" })
    public purchaserId: string;

    @ApiProperty({
        type: DataType.TEXT,
        description: "Purchaser password hash",
        example: "$2a$10$/zLIwRq0nSfGUCnalaesLetiJcO2NJA5N3qrdf1V3J7coGxWlhyU2",
    })
    @Column({ type: DataType.TEXT, unique: false, allowNull: false })
    public password: string;

    // Associations
    @BelongsTo(() => Purchaser)
    public purchaser: Purchaser;
}
