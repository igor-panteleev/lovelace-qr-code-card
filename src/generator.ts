import QRCode from "qrcode";

import { DataUrl } from "../types/types";
import { TranslatableError } from "./error";


class QRCodeGenerator {

    protected readonly inputString: string;

    // TODO: make it configurable
    protected readonly quality = {
        margin: 1,
        width: 500
    }

    public constructor(inputString: string) {
        this.inputString = inputString;
    }

    public async generate(): Promise<DataUrl> {
        try {
            return QRCode.toDataURL(this.inputString, this.quality);
        }
        catch (e: unknown) {
            throw new TranslatableError("generation.unknown_error")
        }
    }

}

export async function generateQR(inputString: string): Promise<DataUrl> {
    return await (new QRCodeGenerator(inputString)).generate();
}
