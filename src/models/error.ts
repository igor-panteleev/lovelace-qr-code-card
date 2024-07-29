import { TranslatableString } from "../types/types";
import { localize } from "../localize/localize";

export class TranslatableError extends Error {
    public constructor(ts: TranslatableString) {
        super(localize(ts));
    }
}
