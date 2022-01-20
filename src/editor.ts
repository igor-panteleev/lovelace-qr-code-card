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
import { AuthenticationType, is_password_protected } from "./models/authentication-type";
import { EDITOR_CUSTOM_ELEMENT_NAME } from "./const";


@customElement(EDITOR_CUSTOM_ELEMENT_NAME)
export class QRCodeCardEditor extends LitElement implements LovelaceCardEditor {
    @property({attribute: false}) public hass?: HomeAssistant;
    @state() private _config?: QRCodeCardConfig;
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
        return config?.ssid || "";
    }

    get _password(): string {
        const config = this._config as WiFiSourceConfig | undefined;
        return config?.password || "";
    }

    get _is_hidden(): boolean {
        const config = this._config as WiFiSourceConfig | undefined;
        return config?.is_hidden || false;
    }
    
    get _entity(): string {
        const config = this._config as EntitySourceConfig | undefined;
        return config?.entity || ""
    }
    
    private _localize(ts: TranslatableString): string {
        return localizeWithHass(ts, this.hass, this._config);
    }

    protected render(): TemplateResult | void {
        if (!this.hass) {
            return html``;
        }

        const entities = Object.keys(this.hass.states);

        return html`
            <div class="card-config">
                <div class="values">
                    <paper-input
                        label=${this._localize("editor.label.title")}
                        .value=${this._title}
                        .configValue=${"title"}
                        @value-changed=${this._valueChanged}></paper-input>
                </div>
                
                <div class="values">
                    <paper-dropdown-menu
                        label=${this._localize("editor.label.source")}
                        @iron-select=${this._selectionChanged}
                        .configValue=${"source"}>
                        <paper-listbox
                            slot="dropdown-content"
                            attr-for-selected="value"
                            .selected=${this._source}>
                            ${Object.values(SourceType).map(source => {
                                return html`<paper-item .value=${source}>${this._localize(`editor.options.source.${source}`)}</paper-item>`;
                            })}
                        </paper-listbox>
                    </paper-dropdown-menu>
                </div>
                
                ${this._config?.source == SourceType.TEXT ? html`
                <div class="values">
                    <paper-input
                        label=${this._localize("editor.label.text")}
                        .value=${this._text}
                        .configValue=${"text"}
                        @value-changed=${this._valueChanged}></paper-input>
                </div>` : ""}
                
                ${this._config?.source == SourceType.WIFI ? html`
                <div class="values">
                    <paper-dropdown-menu
                        label=${this._localize("editor.label.auth_type")}
                        @iron-select=${this._selectionChanged}
                        .configValue=${"auth_type"}>
                        <paper-listbox
                            slot="dropdown-content"
                            attr-for-selected="value"
                            .selected=${this._auth_type}>
                            ${Object.values(AuthenticationType).map(auth_type => {
                                return html`<paper-item .value=${auth_type}>${this._localize(`editor.options.auth_type.${auth_type}`)}</paper-item>`;
                            })}
                        </paper-listbox>
                    </paper-dropdown-menu>
                </div>
                <div class="values">
                    <paper-input
                        label=${this._localize("editor.label.ssid")}
                        .value=${this._ssid}
                        .configValue=${"ssid"}
                        @value-changed=${this._valueChanged}></paper-input>
                </div>
                ${is_password_protected(this._auth_type) ? html`
                <div class="values">
                    <paper-input
                        label=${this._localize("editor.label.password")}
                        .value=${this._password}
                        .configValue=${"password"}
                        @value-changed=${this._valueChanged}></paper-input>
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
                    <paper-dropdown-menu
                        label=${this._localize("editor.label.entity")}
                        @value-changed=${this._valueChanged}
                        .configValue=${"entity"}>
                        <paper-listbox slot="dropdown-content" .selected=${entities.indexOf(this._entity)}>
                            ${entities.map(entity => {
                                return html` <paper-item>${entity}</paper-item> `;
                            })}
                        </paper-listbox>
                    </paper-dropdown-menu>
                </div>` : ""}
              
            </div>
        `;
    }

    private _initialize(): void {
        if (this.hass === undefined) return;
        if (this._config === undefined) return;
        this._initialized = true;
    }

    private _selectionChanged(ev): void {
        ev.stopPropagation();
        this._updateConfig(ev.currentTarget.configValue, ev.detail.item.value);
    }

    private _valueChanged(ev): void {
        ev.stopPropagation();
        const value = ev.target.checked !== undefined ? ev.target.checked : ev.target.value;
        this._updateConfig(ev.target.configValue, value);
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
                padding-left: 16px;
                margin: 8px;
                display: grid;
            }

            ha-formfield {
                padding: 8px;
            }
        `;
    }
}
