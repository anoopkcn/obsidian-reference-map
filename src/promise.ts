export class PromiseCapability<T> {
    settled = false;
    promise: Promise<T>;
    resolve!: (data: T) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject!: (reason?: any) => void;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = (data) => {
                resolve(data);
                this.settled = true;
            };

            this.reject = (reason) => {
                reject(reason);
                this.settled = true;
            };
        });
    }
}
