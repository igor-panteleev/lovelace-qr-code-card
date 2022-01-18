import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { PropertyValues } from "@lit/reactive-element";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";

import "./editor";
import type { DataUrl, QRCodeCardConfig, TranslatableString } from "./types/types";

import { localize, localizeWithHass } from "./localize/localize";
import { version } from '../package.json';
import { generateQR } from "./models/generator";
import { validateConfig } from "./validators";
import { SourceType } from "./models/source-type";
import { CARD_CUSTOM_ELEMENT_NAME, EDITOR_CUSTOM_ELEMENT_NAME } from "./const";

console.info(
  `%c QR-CODE-GENERATOR %c ${version} `,
  'color: black; background: white; font-weight: 700;',
  'color: white; background: black; font-weight: 700;'
);


const windowWithCards = window as unknown as Window & { customCards: unknown[] };
windowWithCards.customCards = windowWithCards.customCards || [];
windowWithCards.customCards.push({
    type: CARD_CUSTOM_ELEMENT_NAME,
    name: "QR Code Card",
    description: localize("common.description"),
    preview: true,
});

@customElement(CARD_CUSTOM_ELEMENT_NAME)
export class QRCodeCard extends LitElement {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(EDITOR_CUSTOM_ELEMENT_NAME);
    }

    public static getStubConfig(): QRCodeCardConfig | undefined {
        return {
            type: "custom:" + CARD_CUSTOM_ELEMENT_NAME,
            source: SourceType.TEXT,
            text: localize("common.description")
        };
    }

    private config!: QRCodeCardConfig;
    @property({ attribute: false }) public _hass!: HomeAssistant;
    @state() private errors: string[] = [];
    @state() private dataUrl = "";

    public set hass(hass: HomeAssistant) {
        this._hass = hass;
    }

    public get hass(): HomeAssistant {
        return this._hass;
    }

    public setConfig(config: QRCodeCardConfig): void {
        if (!config) {
            throw new Error(this._localize("common.invalid_configuration"));
        }
        this.config = config;

        this.errors = validateConfig(this.config);
        if (this.errors.length > 0) {
            return;
        }

        this._generateQR();
    }

    private _generateQR(): void {
        generateQR(this.hass, this.config)
            .then((data_url: DataUrl) => {
                this.dataUrl = data_url;
            }).catch((e: Error) => {
                this.errors = [e.message];
            })
    }

    private _localize(ts: TranslatableString): string {
        return localizeWithHass(ts, this.hass, this.config);
    }

    protected shouldUpdate(changedProperties: PropertyValues): boolean {
        if (changedProperties.has('dataUrl') || changedProperties.has('errors')) return true;

        if (this.config?.entity) {
            const oldHass = changedProperties.get('_hass') as HomeAssistant | undefined;
            if (oldHass) {
                return (
                    oldHass.states[this.config.entity] !== this.hass.states[this.config.entity]
                );
            }
        }

        return false;
    }

    protected render(): TemplateResult {
        if (this.errors.length > 0) {
            return this._showErrors(this.errors);
        }

        if (!this.dataUrl) {
            return html`
                <ha-card>
                    <span>${this._localize("common.loading")}</span>
                </ha-card>
            `
        }

        return html`
            <ha-card>
                <div class="qrcode-overlay">
                    <img class="qrcode" src="${this.dataUrl}">
                </div>
            </ha-card>
          `
    }

    private _showErrors(errors: string[]): TemplateResult {
        errors.forEach(e => console.error(e));
        const errorCard = document.createElement("hui-error-card") as LovelaceCard;
        errorCard.setConfig({
            type: "error",
            error: errors[0],
            origConfig: this.config,
        });

        return html` ${errorCard} `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex: 1;
                flex-direction: column;
            }
            ha-card {
                flex-direction: column;
                flex: 1;
                position: relative;
                padding: 0px;
                border-radius: 4px;
                overflow: hidden;
            }
            .qrcode {
                max-width:100%;
            }
        `
    }
}