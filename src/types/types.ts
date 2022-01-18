import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from "custom-card-helpers";
import { CARD_CUSTOM_ELEMENT_NAME, EDITOR_CUSTOM_ELEMENT_NAME } from "../const";
import { QRCodeCard } from "../qr-code-card";
import { SourceType } from "../models/source-type";
import { AuthenticationType } from "../models/authentication-type";

declare global {
    interface HTMLElementTagNameMap {
        [CARD_CUSTOM_ELEMENT_NAME]: QRCodeCard;
        [EDITOR_CUSTOM_ELEMENT_NAME]: LovelaceCardEditor;
        "hui-error-card": LovelaceCard;
    }
}

export type TranslatableString = string | [string, string, string];
export type Language = string | undefined;
export type DataUrl = string;

export type QRCodeGeneratorClass<T> = new (...args: any[]) => T;

export interface BaseQRCodeCardConfig extends LovelaceCardConfig {
    readonly language?: Language;
    readonly source: SourceType;
}

export interface TextSourceConfig extends BaseQRCodeCardConfig {
    readonly text: string
}

export interface WiFiSourceConfig extends BaseQRCodeCardConfig {
    readonly auth_type: AuthenticationType;
    readonly ssid: string;
    readonly password?: string;
    readonly is_hidden?: boolean;
}

export interface EntitySourceConfig extends BaseQRCodeCardConfig {
    readonly entity: string;
}

export type QRCodeCardConfig =
    | TextSourceConfig
    | WiFiSourceConfig
    | EntitySourceConfig;
