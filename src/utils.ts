import { PropertyValues } from "@lit/reactive-element";
import { HomeAssistant } from "custom-card-helpers";
import { QRCodeCardConfig } from "./types/types"
import { SourceType } from "./models/source-type";

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

        // TODO: add support to use entities for WIFI QR code
        // case SourceType.WIFI:
        //     if (config.ssid.hasOwnProperty("entity")) watchedEntities.add(config.ssid["entity"]);
        //     if (config.password.hasOwnProperty("entity")) watchedEntities.add(config.password["entity"]);
    }

    return [...watchedEntities];
}
