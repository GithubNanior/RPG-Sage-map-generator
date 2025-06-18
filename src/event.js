class Event
{
    constructor()
    {
        this.subscribers = [];
    }

    subscribe(subscriber)
    {
        this.subscribers.push(subscriber);
    }

    unsubscribe(subsciber)
    {
        const index = this.subscribers.indexOf(subsciber);
        if (index != -1)
        {
            this.subscribers.splice(index, 1)
        }
    }

    invoke(...args)
    {
        for (const subscriber of this.subscribers) {
            subscriber(...args);
        }
    }
}

export {
    Event
};