import {
    TranslatableString,
    QRCodeCardConfig,
    TextSourceConfig,
    WiFiSourceConfig,
    EntitySourceConfig,
    QRCodeValidatorClass
} from "./types/types";
import { localize } from "./localize/localize";
import { SourceType } from "./models/source-type";
import { AuthenticationType, isPasswordProtected } from "./models/authentication-type";


abstract class Validator<T> {

    protected readonly config: T;

    public constructor(config: T) {
        this.config = config;
    }

    public validate(): string[] {
        return this._validate()
    }

    protected abstract _validate(): string[]

}

class DebugModeValidator extends Validator<QRCodeCardConfig> {
    protected _validate(): string[] {
        const errors: string[] = [];

        if (this.config.debug !== undefined && typeof this.config.debug !== "boolean") {
            errors.push("validation.debug.invalid");
        }

        return errors;
    }
}

class SourceValidator extends Validator<QRCodeCardConfig> {
    protected _validate(): string[] {
        const errors: string[] = [];

        if (!this.config.source) {
            errors.push("validation.source.missing");
        }
        else {
            if (!Object.values(SourceType).includes(this.config.source)) {
                errors.push("validation.source.invalid");
            }
        }

        return errors;
    }
}

class TextValidator extends Validator<TextSourceConfig> {
    protected _validate(): string[] {
        const errors: string[] = [];

        if (!this.config.text) errors.push("validation.text.missing");

        return errors;
    }
}

class WiFiValidator extends Validator<WiFiSourceConfig> {
    protected _validate(): string[] {
        const errors: string[] = [];

        // Validate auth type
        if (!this.config.auth_type) {
            errors.push("validation.auth_type.missing");
        }
        else {
            if (!Object.values(AuthenticationType).includes(this.config.auth_type)){
                errors.push("validation.auth_type.invalid");
            }
        }

        // Validate ssid
        if (!this.config.ssid) {
            errors.push("validation.ssid.missing");
        } else if (typeof this.config.ssid !== "string" && !this.config.ssid.hasOwnProperty("entity")) {
            errors.push("validation.ssid.entity.missing")
        }

        // Validate password
        if (isPasswordProtected(this.config.auth_type)) {
            if (!this.config.password) {
                errors.push("validation.password.missing");
            } else if (typeof this.config.password !== "string" && !this.config.password.hasOwnProperty("entity")) {
                errors.push("validation.password.entity.missing")
            }
        }

        return errors;
    }
}

class EntityValidator extends Validator<EntitySourceConfig> {
    protected _validate(): string[] {
        const errors: string[] = [];

        if (!this.config.entity) errors.push("validation.entity.missing");

        return errors;
    }
}

const validatorMap = new Map<SourceType, QRCodeValidatorClass<Validator<QRCodeCardConfig>>>([
    [SourceType.TEXT, TextValidator],
    [SourceType.WIFI, WiFiValidator],
    [SourceType.ENTITY, EntityValidator]
]);

export function validateConfig(config: QRCodeCardConfig): string[] {
    const errors: TranslatableString[] = [];

    new SourceValidator(config).validate().forEach(e => errors.push(e));
    new DebugModeValidator(config).validate().forEach(e => errors.push(e));

    if (errors.length == 0) {
        const validatorCls = validatorMap.get(config.source);
        if (validatorCls) new validatorCls(config).validate().forEach(e => errors.push(e));
    }

    return errors.map(e => localize(e, config.language));
}
