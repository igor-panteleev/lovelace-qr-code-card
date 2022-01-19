[![hacs_badge][hacs_shield]][hacs]
[![GitHub Latest Release][releases_shield]][latest_release]

[hacs_shield]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge
[hacs]: https://github.com/hacs/integration

[releases_shield]: https://img.shields.io/github/release/igor-panteleev/lovelace-qr-code-card.svg?style=for-the-badge
[latest_release]: https://github.com/igor-panteleev/lovelace-qr-code-card/releases/latest

# Lovelace QRCode Generator card
This card provides a possibility to generate QRCode in Home Assistant interface.

## Installation
### TODO: add installation instructions

## Configuration

<table>
    <tr>
        <th>Key</th>
        <th>Type</th>
        <th>Required</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>source</code></td>
        <td>string</td>
        <td>yes</td>
        <td><i>text</i></td>
        <td>Card source type. Options: <code>text</code>, <code>entity</code>, <code>wifi</code></td>
    </tr>
    <tr>
        <td colspan="5" style="text-align: center">
            Text mode options
        </td>
    </tr>
    <tr>
        <td><code>text</code></td>
        <td>string</td>
        <td>yes</td>
        <td><i>QRCode example text</i></td>
        <td>Text that will be used for QRCode generation</td>
    </tr>
    <tr>
        <td colspan="5" style="text-align: center">
            Entity mode options
        </td>
    </tr>
    <tr>
        <td><code>entity</code></td>
        <td>string</td>
        <td>yes</td>
        <td>empty</td>
        <td>Entity that will be used for QRCode generation</td>
    </tr>
    <tr>
        <td colspan="5" style="text-align: center">
            Wi-Fi mode options
        </td>
    </tr>
    <tr>
        <td><code>auth_type</code></td>
        <td>string</td>
        <td>yes</td>
        <td>empty</td>
        <td>Wi-Fi network authentication type. Options: <code>WEP</code>, <code>WPA</code>, <code>nopass</code></td>
    </tr>
    <tr>
        <td><code>ssid</code></td>
        <td>string</td>
        <td>yes</td>
        <td>empty</td>
        <td>Wi-Fi network ssid</td>
    </tr>
    <tr>
        <td><code>password</code></td>
        <td>string</td>
        <td>yes (except <code>nopass</code> authentication)</td>
        <td>empty</td>
        <td>Wi-Fi network password</td>
    </tr>
    <tr>
        <td><code>is_hidden</code></td>
        <td>boolean</td>
        <td>no</td>
        <td>empty</td>
        <td>Is Wi-Fi network is hidden</td>
    </tr>
</table>
