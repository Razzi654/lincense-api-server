import { ValidationError } from "@nestjs/common";
import { Utils } from "sequelize";

export type AffectedRows<T> = [affectedCount: number, affectedRows: T[]];
export type ErrorMessage = string | ValidationError[];
export type ObjectProperty = Record<PropertyKey, any>;
export type Stringified<T> = Readonly<Record<keyof T, Utils.Primitive>>;
