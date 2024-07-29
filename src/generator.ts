import QRCode from "qrcode";

import { DataUrl } from "./types/types";
import { TranslatableError } from "./models/error";

const quality = {
    margin: 1,
    width: 500
}

export async function generateQR(inputString: string): Promise<DataUrl> {
    try {
        return QRCode.toDataURL(inputString, quality);
    }
    catch (e: unknown) {
        throw new TranslatableError("generation.unknown_error")
    }
}
