Nechť `IClassManagement` je `./classManagementInterface.IClassManagement`.
Nechť `ClassManagementService` je `./(class-management).service.ClassManagementService`.

Rozhraní `IClassManagement` je implementací takových komponentů, které pro svůj vzhled používají dynamicky operované css třídy (viz níže).

Dynamicky operovanými třídami se rozumí stylové css třídy, jež se v reálném čase frekventovaně mění. K jejich změnám dochátí tak často, že by bylo přinejmenším nepraktické je ručně přenastavovat pokaždé, když se změní. Je mnohem snažší mít objekt, pro který je implementací rozhraní `IClassManagement` zpřístupněna řada metod řešících tuto problematiku.

`IClassManagement` je však pouhým formátem pro komponent, aby se s jeho vzhledem dalo patřičně nakládat. Funkce operující se stylovými třídami jsou pak součástí servisu `ClassManagementService`.

Struktura `IClassManagement` není nijak složitá. Komponent implementující toto rozhraní musí mít členy:
  - `set` a `get` vlastnost `classes`
    `classes` je pole typu `string` (`Array<string>`), jehož řádky budou každý obsazen jednou css třídou.
  - metoda `toggleClasses`
    Zavoláním `toggleClasses` se z pole tříd `classes` utvoří jeden souvislý řetězec a zapíše se jako hodnota do atributu `class` v HTML kontextu v šabloně daného komponentu.
    Pokud není zakázáno, `toggleClasses` se volá použitím metod pro nakládání s css třídami z `ClassManagementService`.

Servis `ClassManagementService` je nutno vyžádat v konstruktoru daného komponentu. Jako u většiny servisů se `dependency injection` postará o předání instance do konstruktoru.

`ClassManagementService` poskytuje metody pro operace s css třídami těch komponentů, které implementují rozhraní `IClassManagement`. Mezi možné operace se stylovýmí třídami patří:
  - přidávání tříd pomocí `addClasses`
  - odebírání tříd pomocí `removeClasses`
  - vymazání veškerých tříd pomocí `clearClasses`

Všechny tyto metody mají nepovinný parametr `toggle: boolean` (není-li předán argument, výchozí hodnota je `true`).
Jestliže je jeho hodnota `true`, automaticky se po modifikaci `classes` daného komponentu zavolá `toggleClasses`, a tak se vizuální změna ihned propíše.

`ClassManagementService` poskytuje i metodu pro formátování z pole tříd `classes` do souvislého řetězce stylových tříd vyhovujícího atributu `class` v HTML kontextu.
 
