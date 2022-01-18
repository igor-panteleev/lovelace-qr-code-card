import {
    TranslatableString,
    QRCodeCardConfig,
    TextSourceConfig,
    WiFiSourceConfig,
    EntitySourceConfig
} from "./types/types";
import { localize } from "./localize/localize";
import { SourceType } from "./models/source-type";
import { AuthenticationType } from "./models/authentication-type";

function validateSource(source: SourceType): string[] {
    if (!source) return ["validation.source.missing"];
    if (!Object.values(SourceType).includes(source)) return ["validation.source.invalid"];
    return [];
}

function validateTextConfig(text: string): string[] {
    if (!text) return ["validation.text.missing"];
    return [];
}


function validateWiFiConfig(auth_type: AuthenticationType, ssid: string, password: string | undefined): string[] {
    if (!auth_type) return ["validation.auth_type.missing"];
    if (!Object.values(AuthenticationType).includes(auth_type)) return ["validation.auth_type.invalid"];

    const errors: string[] = [];
    if (!ssid) {
        errors.push("validation.ssid.missing");
    }
    if (auth_type != AuthenticationType.NOPASS && !password) {
        errors.push("validation.password.missing");
    }
    return errors;
}

function validateEntityConfig(entity: string): string[] {
    if (!entity) return ["validation.entity.missing"];
    return [];
}

export function validateConfig(config: QRCodeCardConfig): string[] {
    const errors: TranslatableString[] = [];
    validateSource(config.source).forEach(e => errors.push(e));
    switch (config.source) {
        case SourceType.TEXT:
            config = config as TextSourceConfig;
            validateTextConfig(config.text).forEach(e => errors.push(e));
            break;
        case SourceType.WIFI:
            config = config as WiFiSourceConfig;
            validateWiFiConfig(config.auth_type, config.ssid, config.password).forEach(e => errors.push(e));
            break;
        case SourceType.ENTITY:
            config = config as EntitySourceConfig;
            validateEntityConfig(config.entity).forEach(e => errors.push(e));
            break;
    }
    return errors.map(e => localize(e, config.language));
}
