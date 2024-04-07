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
  public subscribers: Array<(sender: object | undefined, args: TArgs) => void> = [];

  // přidá předanou funkci do pole funkcí, které se volají, když nastane událost
  public addSubscriber(subscriber: (sender: object | undefined, args: TArgs) => void) {
    this.subscribers.push(subscriber);
  } 

  // přidá předané funkce do pole funkcí, které se volají, když nastane událost
  public addSubscribers(subscribers: Array<(sender: object | undefined, args: TArgs) => void>) {
    this.subscribers = [...this.subscribers, ...subscribers];
  }

  // odstraní všechny výskyty předané funkce z pole funkcí, které se volají, když nastane událost
  public removeSubscriber(subscriber: (sender: object | undefined, args: TArgs) => void) {
    this.subscribers = this.subscribers.filter((s) => {
      if (s === subscriber)
        return false;

      return true;
    });
  }

  // odstraní všechny výskyty předaných funkcí z pole funkcí, které se volají, když nastane událost
  public removeSubscribers(subscribers: Array<(sender: object | undefined, args: TArgs) => void>) {
    this.subscribers = this.subscribers.filter((subscriber) => {
      if (subscribers.includes(subscriber))
        return false;

      return true;
    });
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
    this.subscribers.forEach((subscriber) => {
      subscriber(sender, args);
    });
  }
}
