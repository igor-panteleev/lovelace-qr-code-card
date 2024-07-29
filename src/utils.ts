import { PropertyValues } from "@lit/reactive-element";
import { HomeAssistant } from "custom-card-helpers";
import { QRCodeCardConfig } from "./types/types"
import { SourceType } from "./models/source-type";
import { TranslatableError } from "./models/error";

export function hasConfigOrAnyEntityChanged(
    watchedEntities: string[],
    changedProps: PropertyValues,
    forceUpdate: boolean,
    hass?: HomeAssistant,
): boolean {
    if (changedProps.has("config") || forceUpdate) {
        return true;
    }
    const oldHass = changedProps.get("_hass") as HomeAssistant | undefined;
    return !oldHass || watchedEntities.some(entity => oldHass.states[entity] !== hass?.states[entity]);
}

export function getWatchedEntities(config: QRCodeCardConfig): string[] {
    const watchedEntities = new Set<string>();

    switch (config.source) {
        case SourceType.ENTITY:
            watchedEntities.add(config.entity);
            break;

        case SourceType.WIFI:
            if (config.ssid.hasOwnProperty("entity")) watchedEntities.add(config.ssid["entity"]);
            if (config.password.hasOwnProperty("entity")) watchedEntities.add(config.password["entity"]);
    }

    return [...watchedEntities];
}

export function getValueFromConfig(hass: HomeAssistant, config: QRCodeCardConfig, property: string): string {
    let result: string;

    const configProperty = config[property];
    if (configProperty === undefined) {
        throw new TranslatableError(`validation.${property}.missing`)
    } else if (typeof configProperty === "string") {
        result = configProperty;
    } else if (configProperty.hasOwnProperty("entity")) {
        const entity = hass?.states[configProperty.entity]
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
