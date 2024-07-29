import QRCode from "qrcode";

import {
    DataUrl, EntitySourceConfig,
    QRCodeCardConfig,
    QRCodeGeneratorClass,
    TextSourceConfig,
    WiFiSourceConfig,
} from "../types/types";
import { isPasswordProtected } from "./authentication-type";
import { SourceType } from "./source-type";
import { getValueFromConfig } from "../utils"
import { HomeAssistant } from "custom-card-helpers";
import { TranslatableError } from "./error";


abstract class QRCodeGenerator<T> {

    protected readonly config: T;
    protected readonly hass: HomeAssistant;

    // TODO: make it configurable
    protected readonly quality = {
        margin: 1,
        width: 500
    }

    public constructor(hass: HomeAssistant, config: T) {
        this.hass = hass;
        this.config = config;
    }

    public async generate(): Promise<DataUrl> {
        try {
            return QRCode.toDataURL(this.input, this.quality);
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

    protected abstract get input(): string

}


class TextQRCodeGenerator extends QRCodeGenerator<TextSourceConfig> {

    protected get input(): string {
        return this.config.text || "";
    }
}


class WiFiQRCodeGenerator extends QRCodeGenerator<WiFiSourceConfig> {
    protected readonly special_chars = ['\\', ';', ',', '"', ':']

    protected _escape(plain: string): string {
        return this.special_chars.reduce(
            (previousValue, currentValue) => {
                return previousValue.replace(currentValue, '\\'+currentValue)
            },
            plain
        );
    }

    protected get input(): string {
        const ssid = getValueFromConfig(this.hass, this.config, "ssid");
        let text = `WIFI:T:${this.config.auth_type || ""};S:${this._escape(ssid)};`;

        if (isPasswordProtected(this.config.auth_type)) {
            const password = getValueFromConfig(this.hass, this.config, "password");
            text += `P:${this._escape(password)};`
        }

        if (!this.config.is_hidden) {
            text += "H:true"
        }

        return text;
    }
}

class EntityQRCodeGenerator extends QRCodeGenerator<EntitySourceConfig> {
    protected get input(): string {
        return getValueFromConfig(this.hass, this.config, "entity")
    }
}

const generatorMap = new Map<SourceType, QRCodeGeneratorClass<QRCodeGenerator<QRCodeCardConfig>>>([
    [SourceType.TEXT, TextQRCodeGenerator],
    [SourceType.WIFI, WiFiQRCodeGenerator],
    [SourceType.ENTITY, EntityQRCodeGenerator]
]);


export async function generateQR(hass: HomeAssistant, config: QRCodeCardConfig): Promise<DataUrl> {
    const generatorCls = generatorMap.get(config.source);

    if (!generatorCls) throw new TranslatableError("validation.source.invalid");

    return await (new generatorCls(hass, config)).generate();
}
