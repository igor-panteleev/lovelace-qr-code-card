import { mdiEye, mdiEyeOff } from "@mdi/js";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators";
import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";

import {
    EntitySourceConfig,
    QRCodeCardConfig,
    TextSourceConfig,
    TranslatableString,
    WiFiSourceConfig
} from "./types/types";
import { localizeWithHass } from "./localize/localize";
import { SourceType } from "./models/source-type";
import { AuthenticationType, isPasswordProtected } from "./models/authentication-type";
import { EDITOR_CUSTOM_ELEMENT_NAME } from "./const";


@customElement(EDITOR_CUSTOM_ELEMENT_NAME)
export class QRCodeCardEditor extends LitElement implements LovelaceCardEditor {
    @property({attribute: false}) public hass?: HomeAssistant;
    @state() private _config?: QRCodeCardConfig;
    @state() private _unmaskedPassword = false;
    private _initialized = false;

    public setConfig(config: QRCodeCardConfig): void {
        this._config = config;
    }

    protected shouldUpdate(): boolean {
        if (!this._initialized) {
            this._initialize();
        }
        return true;
    }

    get _title(): string {
        return this._config?.title || "";
    }

    get _source(): SourceType | undefined {
        return this._config?.source;
    }

    get _text(): string {
        const config = this._config as TextSourceConfig | undefined;
        return config?.text || "";
    }

    get _auth_type(): AuthenticationType | undefined {
        const config = this._config as WiFiSourceConfig | undefined;
        return config?.auth_type;
    }

    get _ssid(): string {
        const config = this._config as WiFiSourceConfig | undefined;
        if (typeof config?.ssid === "string") {
            return config?.ssid || "";
        }
        return ""
    }

    get _password(): string {
        const config = this._config as WiFiSourceConfig | undefined;
        if (typeof config?.password === "string") {
            return config?.password || "";
        }
        return "";
    }

    get _is_hidden(): boolean {
        const config = this._config as WiFiSourceConfig | undefined;
        return config?.is_hidden || false;
    }

    get _is_debug(): boolean {
        const config = this._config as QRCodeCardConfig | undefined;
        return config?.debug || false;
    }
    
    get _entity(): string {
        const config = this._config as EntitySourceConfig | undefined;
        return config?.entity || ""
    }

    private _isDisabled(): boolean {
        return this._config?.source === SourceType.WIFI && (typeof this._config?.ssid !== "string" || typeof this._config?.password !== "string");
    }

    private _localize(ts: TranslatableString): string {
        return localizeWithHass(ts, this.hass, this._config);
    }

    protected render(): TemplateResult | void {
        if (!this.hass) {
            return html``;
        }

        if (this._isDisabled()) {
            return html`
                <div class="card-config">
                    <div class="error">${this._localize("editor.yaml_mode")}</div>
                </div>`;
        }

        const entities = Object.keys(this.hass.states);

        return html`
            <div class="card-config">
                <div class="values">
                    <ha-textfield
                        label=${this._localize("editor.label.title")}
                        .value=${this._title}
                        .configValue=${"title"}
                        @input=${this._valueChanged}></ha-textfield>
                </div>
                
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="${this._localize("editor.label.source")}"
                        @selected="${this._valueChanged}"
                        @closed="${ev => ev.stopPropagation()}"
                        .configValue="${"source"}"
                        .value="${this._source}">
                        ${Object.values(SourceType).map(source => {
                            return html` <mwc-list-item .value="${source}">${this._localize(`editor.options.source.${source}`)}</mwc-list-item> `;
                        })}
                    </ha-select>
                </div>
                
                ${this._config?.source == SourceType.TEXT ? html`
                <div class="values">
                    <ha-textfield
                        label="${this._localize("editor.label.text")}"
                        .value="${this._text}"
                        .configValue="${"text"}"
                        @input="${this._valueChanged}"></ha-textfield>
                </div>` : ""}
                
                ${this._config?.source == SourceType.WIFI ? html`
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="${this._localize("editor.label.auth_type")}"
                        @selected="${this._valueChanged}"
                        @closed="${ev => ev.stopPropagation()}"
                        .configValue="${"auth_type"}"
                        .value="${this._auth_type}">
                        ${Object.values(AuthenticationType).map(auth_type => {
                            return html` <mwc-list-item .value="${auth_type}">${this._localize(`editor.options.auth_type.${auth_type}`)}</mwc-list-item> `;
                        })}
                    </ha-select>
                </div>
                <div class="values">
                    <ha-textfield
                        label=${this._localize("editor.label.ssid")}
                        .value=${this._ssid}
                        .configValue=${"ssid"}
                        @input=${this._valueChanged}></ha-textfield>
                </div>
                ${isPasswordProtected(this._auth_type) ? html`
                <div class="values">
                    <ha-textfield
                        .type=${this._unmaskedPassword ? "text" : "password"}
                        .label=${this._localize("editor.label.password")}
                        .value=${this._password}
                        .configValue=${"password"}
                        .suffix="${html`<div style="width: 24px"></div>`}"
                        @input=${this._valueChanged}>
                    </ha-textfield>
                    <ha-icon-button
                        toggles
                        .label=${this._unmaskedPassword ? this._localize("editor.title.hide_password") : this._localize("editor.title.show_password")}
                        @click=${this._toggleUnmaskedPassword}
                        .path=${this._unmaskedPassword ? mdiEyeOff : mdiEye}
                    ></ha-icon-button>
                    
                </div>
                ` : ""}
                <div class="values">
                    <ha-formfield .label=${this._localize("editor.label.is_hidden")}>
                        <ha-switch
                            .checked=${this._is_hidden}
                            .configValue=${"is_hidden"}
                            @change=${this._valueChanged}></ha-switch>
                    </ha-formfield>
                </div>
                ` : ""}
              
              ${this._config?.source == SourceType.ENTITY ? html`
                <div class="values">
                    <ha-select
                        naturalMenuWidth
                        fixedMenuPosition
                        label="${this._localize("editor.label.entity")}"
                        @selected="${this._valueChanged}"
                        @closed="${ev => ev.stopPropagation()}"
                        .configValue="${"entity"}"
                        .value="${this._entity}">
                        ${entities.map(entity => {
                            return html` <mwc-list-item .value="${entity}">${entity}</mwc-list-item>`;
                        })}
                    </ha-select>
                </div>` : ""}
                
                <div class="values">
                    <ha-formfield .label=${this._localize("editor.label.is_debug")}>
                        <ha-switch
                            .checked=${this._is_debug}
                            .configValue=${"debug"}
                            @change=${this._valueChanged}></ha-switch>
                    </ha-formfield>
                </div>
            </div>
        `;
    }

    private _initialize(): void {
        if (this.hass === undefined) return;
        if (this._config === undefined) return;
        this._initialized = true;
    }

    private _valueChanged(ev): void {
        ev.stopPropagation();
        const value = ev.target.checked !== undefined ? ev.target.checked : ev.target.value;
        this._updateConfig(ev.target.configValue, value);
    }

    private _toggleUnmaskedPassword(): void {
        this._unmaskedPassword = !this._unmaskedPassword;
    }

    private _updateConfig(key: string, value: any) {
        if (!this._config || !this.hass) {
            return;
        }

        if (this[`_${key}`] === value) {
            return;
        }

        if (!key) {
            const tmpConfig = { ...this._config };
            delete tmpConfig[value];
            this._config = tmpConfig;
        } else {
            this._config = {
                ...this._config,
                [key]: value,
            };
        }
        fireEvent(this, "config-changed", { config: this._config });
    }

    static get styles(): CSSResultGroup {
        return css`
            .values {
              margin-top: 8px;
              margin-bottom: 16px;
              display: block;
              position: relative;
            }
            
            ha-textfield,
            ha-select {
                width: 100%;
            }
            
            ha-icon-button {
              position: absolute;
              top: 8px;
              right: 8px;
              inset-inline-start: initial;
              inset-inline-end: 8px;
              --mdc-icon-button-size: 40px;
              --mdc-icon-size: 20px;
              color: var(--secondary-text-color);
              direction: var(--direction);
            }
            
            .error {
                color: var(--error-color);
            }
        `;
    }
}
