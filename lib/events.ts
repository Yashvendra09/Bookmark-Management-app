type Listener<T> = (data: T) => void;

class EventEmitter {
    private listeners: { [key: string]: Listener<any>[] } = {};

    on<T>(event: string, listener: Listener<T>) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        return () => {
            this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
        };
    }

    emit<T>(event: string, data: T) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((listener) => listener(data));
        }
    }
}

export const events = new EventEmitter();
