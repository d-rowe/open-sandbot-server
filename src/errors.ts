export class SerialError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SerialError';
    }
}

export class MovementLockError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MovementLockError';
    }
}
