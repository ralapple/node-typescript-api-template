import { ILog } from "./ILog";


export class HttpResponseLog implements ILog {
    constructor(
        private responseCode: number,
    ){}

    toString(): string {
        return ""
    }
}