[![hacs_badge][hacs_shield]][hacs]
[![GitHub Latest Release][releases_shield]][latest_release]

# Lovelace QRCode Generator card
This card provides a possibility to generate QRCode in Home Assistant interface.

## Installation
- [Add custom <code>Lovelace</code> repository to HACS](https://hacs.xyz/docs/faq/custom_repositories)
- Go to "Frontend" section
- Click button with "+" icon
- Search for "QRCode generator card"
- Install repository in HACS

## Configuration

### Main config

| Key                   | Type                                     | Required        | Default             | Description                                                             |
|-----------------------|------------------------------------------|-----------------|---------------------|-------------------------------------------------------------------------|
| *Generic options*     |
| `title`               | string                                   | no              | empty               | Title for the card                                                      |
| `source`              | string                                   | yes             | `text`              | Card source type.<br/>Options: `text,` `entity`, `wifi`                 |
| *Text mode options*   |
| `text`                | string                                   | yes             | QRCode example text | Text that will be used for QRCode generation                            |
| *Entity mode options* |
| `entity`	             | string	                                | yes	          | empty	            | Entity that will be used for QRCode generation                          |
| *Wi-Fi mode options*  |
| `auth_type`           | string	                                | yes	          | empty               | Wi-Fi network authentication type.<br/>Options: `WEP`, `WPA`, `nopass`  |
| `ssid`                | string \| [EntityConfig](#entity-config) | yes             | empty               | Wi-Fi network ssid                                                      |
| `password`            | string \| [EntityConfig](#entity-config) | yes<sup>1</sup> | empty               | Wi-Fi network password                                                  |
| `is_hidden`           | boolean                                  | no              | empty               | Is Wi-Fi network is hidden                                              |

<sup>1</sup>Required for `WEP` and `WPA` authentication

### Entity Config

| Key         | Type   | Required | Description                                                              |
|-------------|--------|----------|--------------------------------------------------------------------------|
| `entity`    | string | yes      | Entity to get state from                                                 |
| `attribute` | string | no       | Enables usage of a configured attribute instead of state of given entity |


### Example WiFi config
```yaml
type: custom:qr-code-card
source: wifi
title: My Awesom WiFi
auth_type: WPA
ssid: my_awesom_wifi
password:
  entity: input_text.my_super_secure_password
```

[hacs_shield]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge
[hacs]: https://github.com/hacs/integration

[releases_shield]: https://img.shields.io/github/release/igor-panteleev/lovelace-qr-code-card.svg?style=for-the-badge
[latest_release]: https://github.com/igor-panteleev/lovelace-qr-code-card/releases/latest
