export class Event<TArgs> {

  // Metody, které se zde budou ukládat by měly být "arrow function", jinak ve třídě, kde jsou deklarovány, nebudou mít přístup k instanci this.
  public subscribers: Array<(sender: object | undefined, args: TArgs) => void> = [];
  public addSubscriber(subscriber: (sender: object | undefined, args: TArgs) => void) {
    this.subscribers.push(subscriber);
  }

  public addSubscribers(subscribers: Array<(sender: object | undefined, args: TArgs) => void>) {
    this.subscribers = [...this.subscribers, ...subscribers];
  }

  public removeSubscriber(subscriber: (sender: object | undefined, args: TArgs) => void) {
    this.subscribers = this.subscribers.filter((s) => {
      if (s === subscriber)
        return false;

      return true;
    });
  }

  public removeSubscribers(subscribers: Array<(sender: object | undefined, args: TArgs) => void>) {
    this.subscribers = this.subscribers.filter((subscriber) => {
      if (subscribers.includes(subscriber))
        return false;

      return true;
    });
  }

  public clearSubscribers() {
    this.subscribers = [];
  }

  public invoke(sender: object | undefined, args: TArgs) {
    this.subscribers.forEach((subscriber) => {
      subscriber(sender, args);
    });
  }
}
