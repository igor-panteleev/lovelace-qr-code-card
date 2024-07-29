import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { PropertyValues } from "@lit/reactive-element";
import { HomeAssistant, LovelaceCard, LovelaceCardEditor } from "custom-card-helpers";

import "./editor";
import type {QRCodeCardConfig, TranslatableString } from "./types/types";

import { localize, localizeWithHass } from "./localize/localize";
import { getWatchedEntities, hasConfigOrAnyEntityChanged } from "./utils"
import { version } from '../package.json';
import { getInputString } from "./models/data-builder";
import { generateQR } from "./generator";
import { validateConfig } from "./validators";
import { SourceType } from "./models/source-type";
import { CARD_CUSTOM_ELEMENT_NAME, EDITOR_CUSTOM_ELEMENT_NAME } from "./const";
import { TranslatableError } from "./models/error";

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
            text: "QRCode example text"
        };
    }

    private config!: QRCodeCardConfig;
    private watchedEntities: string[] = [];
    private inputString!: string;
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

        this.watchedEntities = getWatchedEntities(this.config)
        this.requestUpdate("config");
    }

    private async _updateQR(): Promise<void> {
        try {
            this.inputString = getInputString(this.hass, this.config)
            this.dataUrl = await generateQR(this.inputString);
        } catch (e: unknown) {
            if (e instanceof TranslatableError) {
                this.errors = [e.message]
            } else {
                this.errors = [this._localize("generation.unknown_error")];
            }
        }
    }

    private _localize(ts: TranslatableString): string {
        return localizeWithHass(ts, this.hass, this.config);
    }

    protected shouldUpdate(changedProperties: PropertyValues): boolean {
        if (!this.config) {
            return false;
        }
        return hasConfigOrAnyEntityChanged(this.watchedEntities, changedProperties, false, this.hass);
    }

    protected async update(changedProperties: PropertyValues): Promise<void> {
        if (this.errors.length == 0) {
            await this._updateQR();
        }
        super.update(changedProperties);
  }

    protected render(): TemplateResult {
        if (this.errors.length > 0) {
            return this._showErrors();
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
                ${(this.config?.title ?? "").length > 0 ? html`<h1 class="card-header">${this.config.title}</h1>`: ""}
                ${(this.config?.debug ?? false) ? html`<p>Input string: ${this.inputString}</p>`: ""}
                <div class="qrcode-overlay">
                    <img class="qrcode" src="${this.dataUrl}">
                </div>
            </ha-card>
          `
    }

    private _showErrors(): TemplateResult {
        this.errors.forEach(e => console.error(e));
        const errorCard = document.createElement("hui-error-card") as LovelaceCard;
        customElements.whenDefined("hui-error-card").then(() => {
            errorCard.setConfig({
                type: "error",
                error: this.errors[0],
                origConfig: this.config,
            });
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
                padding: 0;
                border-radius: 6px;
                overflow: hidden;
            }
            .qrcode {
                max-width:100%;
            }
        `
    }
}