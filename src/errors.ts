export class SerialError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SerialError';
    }
}
