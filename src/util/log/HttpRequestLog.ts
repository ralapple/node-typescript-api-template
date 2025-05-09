import { ILog } from "./ILog";

export class HttpRequestLog implements ILog {
    constructor(
        private requestID: string,
        private requestMethod: string,
        private requestOriginURL: string,
        private requestIP: string,
        private requestUserAgent: string,
        private requestBody: string,
        private requstQuery: string,
    ) {}

    toString(): string {
        return `Request [${this.requestID}] ${this.requestMethod} ${this.requestOriginURL} | IP: ${this.requestIP} | User-Agent: ${this.requestUserAgent} | Body: ${this.requestBody} | Query: ${this.requstQuery}`
    }
}