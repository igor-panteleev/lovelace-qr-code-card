import {
    EntitySourceConfig,
    QRCodeCardConfig,
    QRCodeGeneratorClass,
    TextSourceConfig,
    WiFiSourceConfig,
} from "../types/types";
import { isPasswordProtected } from "./authentication-type";
import { SourceType } from "./source-type";
import { HomeAssistant } from "custom-card-helpers";
import { TranslatableError } from "./error";


abstract class QRCodeDataBuilder<T> {

    protected readonly config: T;
    protected readonly hass: HomeAssistant;

    public constructor(hass: HomeAssistant, config: T) {
        this.hass = hass;
        this.config = config;
    }

    public getInputString(): string {
        try {
            return this._getInputString();
        }
        catch (e: unknown) {
            if (e instanceof TranslatableError) {
                throw e
            } else if (e instanceof Error) {
                throw new TranslatableError(["generation.error", "{message}", e.message])
            }
            throw new TranslatableError("generation.unknown_error")
        }
    }

    protected abstract _getInputString(): string

    protected _getValueFromConfig(property: string): string {
        let result: string;

        const configProperty = this.config[property];
        if (configProperty === undefined) {
            throw new TranslatableError(`validation.${property}.missing`)
        } else if (typeof configProperty === "string") {
            result = configProperty;
        } else if (configProperty.hasOwnProperty("entity")) {
            const entity = this.hass?.states[configProperty.entity]
            if (entity === undefined) {
                throw new TranslatableError([`validation.${property}.unknown_entity`, "{entity}", configProperty.entity])
            }
            if (configProperty.attribute !== undefined) {
                const attribute_value = entity.attributes[configProperty.attribute];
                if (attribute_value === undefined) {
                    throw new TranslatableError([`validation.${property}.unknown_attribute`, "{attribute}", configProperty.attribute])
                }
                result = attribute_value.toString();
            } else {
                const state = entity.state;
                if (state === "unavailable") {
                    throw new TranslatableError([`validation.${property}.unavailable`, "{entity}", configProperty.entity])
                }
                result = state;
            }
        } else {
            throw new TranslatableError([`validation.${property}.unknown_type`, "{type}", typeof configProperty])
        }

        return result;
    }
}


class TextQRCodeDataBuilder extends QRCodeDataBuilder<TextSourceConfig> {

    protected _getInputString(): string {
        return this.config.text || "";
    }
}


class WiFiQRCodeDataBuilder extends QRCodeDataBuilder<WiFiSourceConfig> {
    protected readonly special_chars = ['\\', ';', ',', '"', ':']

    protected _escape(plain: string): string {
        return this.special_chars.reduce(
            (previousValue, currentValue) => {
                return previousValue.replace(currentValue, '\\'+currentValue)
            },
            plain
        );
    }

    protected _getInputString(): string {
        const ssid = this._getValueFromConfig("ssid");
        let text = `WIFI:T:${this.config.auth_type || ""};S:${this._escape(ssid)};`;

        if (isPasswordProtected(this.config.auth_type)) {
            const password = this._getValueFromConfig("password");
            text += `P:${this._escape(password)};`
        }

        if (this.config.is_hidden) {
            text += "H:true"
        }

        return text;
    }
}

class EntityQRCodeDataBuilder extends QRCodeDataBuilder<EntitySourceConfig> {
    protected _getInputString(): string {
        return this._getValueFromConfig("entity")
    }
}

const configBuilderMapping = new Map<SourceType, QRCodeGeneratorClass<QRCodeDataBuilder<QRCodeCardConfig>>>([
    [SourceType.TEXT, TextQRCodeDataBuilder],
    [SourceType.WIFI, WiFiQRCodeDataBuilder],
    [SourceType.ENTITY, EntityQRCodeDataBuilder]
]);


export function getInputString(hass: HomeAssistant, config: QRCodeCardConfig): string {
    const dataBuilderCls = configBuilderMapping.get(config.source);

    if (!dataBuilderCls) throw new TranslatableError("validation.source.invalid");

    return new dataBuilderCls(hass, config).getInputString();
}
