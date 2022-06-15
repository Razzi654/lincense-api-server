import { ConfigModuleOptions } from "@nestjs/config";
import { SequelizeModuleOptions } from "@nestjs/sequelize";
import { TableOptions, Model } from "sequelize-typescript";
import { AuthAccount } from "src/auth/models/auth.model";
import { Purchaser } from "src/license-keys-purchasers/models/purchasers.model";
import { LicenseKey } from "src/license-keys/models/license-keys.model";
import { SoftwareProduct } from "src/software-products/models/products.model";
import { ExceptionResponse } from "src/util-classes/exception-response.util";
import { ObjectProperty, Stringified } from "./types";

export const getEnvConfig = (): ConfigModuleOptions => {
    const { NODE_ENV } = process.env;
    return {
        cache: true,
        isGlobal: true,
        envFilePath: `.${NODE_ENV}.env`,
    };
};

export const getDbConfig = (): SequelizeModuleOptions => {
    const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } =
        process.env;
    return {
        dialect: "postgres",
        host: POSTGRES_HOST,
        port: Number(POSTGRES_PORT),
        database: POSTGRES_DB,
        username: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        models: [Purchaser, LicenseKey, SoftwareProduct, AuthAccount],
        autoLoadModels: true,
    };
};

export const getVersion = (...args: string[] | number[]): string => args.join(".");

export const addProperty = <T1 extends object, T2 extends object = ObjectProperty>(
    obj: T1,
    property: T2
): T1 & T2 => Object.assign(obj, property);

export const getDefaultTableOptions = (tableName: string): TableOptions<Model> =>
    addProperty(
        { tableName },
        { createdAt: "created_at", updatedAt: "updated_at", underscored: true }
    );

export const getLicenseGenBaseUrl = (): string => {
    const {
        LICENSE_GEN_DOMAIN: domain,
        LICENSE_GEN_PORT: port,
        LICENSE_GEN_PREFIX: prefix,
        LICENSE_GEN_NAME: name,
        LICENSE_GEN_VER: v,
    } = process.env;
    return `${domain}:${port}${prefix}v${v}/${name}/`;
};

export const isValidDate = (date: Date): boolean => {
    if (Object.prototype.toString.call(date) !== "[object Date]") {
        return false;
    }
    return !isNaN(date.getTime());
};

export const stringifyProperties = <T extends object>(obj: T): Stringified<T> => {
    const newObj: Stringified<T> = Object();
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[String(key)] = obj[key].valueOf();
        }
    }
    return newObj;
};

export const isObject = (obj: any): obj is object => {
    return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object Object]";
};
