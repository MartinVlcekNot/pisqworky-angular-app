// TArgs: Typ (objektu) argumentů, které bude mít funkce za své parametry
export class Event<TArgs> {

  // pole funkcí, které se volají po nastání události
  //
  // funkce typu '(sender: object | undefined, args: TArgs) => void'
  //    sender: objekt, kde byla událost vyvolána
  //            může být undefined, pokud je událost vyvolána např ve statické třídě, kde není přístup k instanci 'this'
  //    args: argumenty k události typu 'TArgs'
  //
  // funkce, které se zde budou ukládat, musí být "arrow function", jinak ve třídě, kde jsou deklarovány, nebudou mít přístup k instanci 'this'
  public subscribers: Array<Subscriber<TArgs>> = [];

  protected priorities: Array<number> = [];

  // přidá předanou funkci do pole funkcí, které se volají, když nastane událost
  public addSubscriber(handler: Handler<TArgs>, priority?: number) {
    const defPriority = priority !== undefined ? priority : 1;
    if (!this.priorities.includes(defPriority)) {
      this.priorities.push(defPriority);

      this.priorities.sort((a, b) => a - b);
    }

    this.subscribers.push({ handler: handler, priority: defPriority });
  } 

  // přidá předané funkce do pole funkcí, které se volají, když nastane událost
  public addSubscribers(subscribers: Array<{ handler: Handler<TArgs>, priority?: number }>) {
    subscribers.forEach((subscriber) => {
      this.addSubscriber(subscriber.handler, subscriber.priority);
    });
  }

  // odstraní všechny výskyty předané funkce z pole funkcí, které se volají, když nastane událost
  public removeSubscriber(subscriber: Handler<TArgs>) {
    this.subscribers = this.subscribers.filter((s) => s.handler !== subscriber);
  }

  // odstraní všechny výskyty předaných funkcí z pole funkcí, které se volají, když nastane událost
  public removeSubscribers(subscribers: Array<Handler<TArgs>>) {
    this.subscribers = this.subscribers.filter((subscriber) => !subscribers.includes(subscriber.handler));
  }

  // odstraní všechny funkce z pole funkcí, které se volají, když nastane událost
  public clearSubscribers() {
    this.subscribers = [];
  }

  // vyvolá událost
  //
  // sender: objekt, kde byla událost vyvolána
  //            může být undefined, pokud je událost vyvolána např ve statické třídě, kde není přístup k instanci 'this'
  // args: argumenty k události typu 'TArgs', které se předají všem volaným funkcím
  public invoke(sender: object | undefined, args: TArgs) {
    let subsByPriority: Array<Subscriber<TArgs>> = [];

    this.priorities.forEach((pri) => {
      this.subscribers.forEach((subs) => {
        if (subs.priority === pri)
          subs.handler(sender, args);
      });
    });
  }
}

export type Handler<TArgs> = (sender: object | undefined, args: TArgs) => void;

export type Subscriber<TArgs> = {
  handler: Handler<TArgs>;
  priority: number;
}
