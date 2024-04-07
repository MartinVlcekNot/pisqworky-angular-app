Nechť `Event` je `./event.Event`.

Třída `Event` je z velké části inspirována EventHandlery z frameworku `.NET` pro jazyk `C#`. Funguje na principu zájmu na vyvstání události. Když nastane událost, jsou vyvoláni všichni zájemci o ošetření případu nastání události (zájemci se rozumí procedury nebo samostatné funkce). Výhoda tohoto konceptu oproti klasickému zpracování pomocí zavolání jedné funkce tkví v možnosti mít pod rukou celé pole funkcí, nezávislých na sobě (často pocházejících z opačných koutů projeku), a pracovat s jednotlivými funkcemi zvlášť; v určité situaci bude potřeba buď přidat další takovou funkci, nebo nějakou odebrat.

`Event` je generická třída a pro vytvoření instance je třeba uvést typ objektu argumentů, které budou po vyvstání události sloužit pro popsání okolností dané situace.

Chceme-li vytvořit novou událost, určíme nejdřív, jakých argumentů využijeme pro vystižení situace, jež nastane. Všechny argumenty zabalíme do objektu a tento objekt předáme jako typ argumentů.
Pro událost, která je součástí fiktivní třídy `Person`: `public ageChange: Event<{ newAge: number }>`
Událost `ageChange` je teď členem třídy `Person`.

Událost `ageChange` se dá vyvolat `ageChange.invoke` (obecně `Event.invoke`).
Pro vyvolání události je potřeba do metody `invoke` předat argumenty (okolnosti situace) a případně místo, kde nastala.
Vyvoláním události se zavolají všechny funkce, které mají zájem na ošetření události; do jejich parametrů se předají argumenty předané metodě `invoke`.

funkce mající zájem na události lze libovolně přidávat (`Event.addSubscriber`) a odebírat (`Event.removeSubscriber`). Pro hromadné přidávání a odebírání funkcí slouží metody `Event.addSubscribers` a `Event.removeSubscribers`, případně `Event.clearSubscribers` pro úplné vymazání celého výčtu. 
Aby mohla být do seznamu určitá funkce přidána, musí splňovat tato kritéria:
  - funkce musí být návratového typu `void`
  - musí mít právě dva parametry a to: `sender: object | undefined`, `args` (typ záleží na typu události; pro `Event<{ ageChange: number }` je typ `args` `{ ageChange: number }`)
  - ve chvíli, kdy je funkce členem objektu s přístupem k instanci `this` (např. třída), musí být `arrow function`, aby k této instanci měla přístup
