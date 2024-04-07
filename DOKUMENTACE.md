# Pisqapp

Klasická hra pišqworek obohacená o možnost rozhodovat o parametrech jako například velikost hracího pole nebo výherní počet v řadě.

## 1- Pravidla

Pravidla této hry jsou vskutku jednoduchá. 
1. Dva hráči se střídají v umisťování svých znaků do hracího pole. 
2. Do buňky, která je již obsazená některým z hráčů, nelze umístit jakýkoli další znak.
3. Vyhrává ten hráč, kterému se, umístěním svého znaku do hracího pole, jako prvnímu podaří dosáhnout nebo překročit stanovený počet znaků jdoucích za sebou (pro daný počet 'n' výherních buněk, kde dvě soudední buňky mají vždy společnou stranu nebo roh, existuje přímka, která prochází středem každé této buňky).
4. Při zaplnění celého hracího pole, když žádný z hráčů nedosáhl výhry, nastává remíza.

## 2- Interakce s uživatelským rozhraním

#### 2-1- Umístění symbolu
Kliknutím do určité buňky hrací desky se na toto místo umístí znak hráče na tahu.

#### 2-2- Signalizace výhry
Výhra je signalizována zešednutím všech obsazených buněk vyjma těch výherních, jejichž symboly ve výsledku zůstanou barevné, aby byla výhra jednoznačně viditelná.

Dále je výhra zapsána i do konzole.

Po dosažení výhry již není možné do hracího pole dál umisťovat symboly a pro novou hru je potřeba resetování.

#### 2-3- Nová hra
Stisknutím tlačítka `restart` se hrací pole vrátí do počátečního stavu; vymažou se všechny položené symboly a nechť hra může začít znovu.

## 3- Vylepšení jednoduchého konceptu

### 3-1- Možnost navolit si parametry hry
U nejjednodušších exemplářů této hry (známých jako `Tic tac toe`) a nejenom u nich jsme často limitováni skutečností, že rozměry pole jsou neměnné a stejně tak výherní počet symbolů. Pišqworky ale mají mnohem větší potenciál. Je pozoruhodné zkoumat, jak malou změnou parametrů, týkajících se velikosti hrací desky a výherní řady, můžeme naprosto zásadně ovlivnit vyváženost hry. Někdy vyústí jen a jen v remízu, někdy způsobí nevyhnutelnou prohru hráče druhého v pořadí.

K modifikaci zmíněných vlastností slouží lišta vlevo nahoře.

#### 3-1-1- Šířka
`šířka` určuje počet buněk v jednom řádku hracího pole.
Povolené hodnoty jsou celá čísla 1 až 40 včetně. Při zadání neplatné hodnoty se vstupní pole zbarví červeně a `šířka` zůstává rovna poslední platné hodnotě.

#### 3-1-2- Výška
`výška` určuje počet řádků hracího pole.
Povolené hodnoty jsou celá čísla 1 až 40 včetně. Při zadání neplatné hodnoty se vstupní pole zbarví červeně a `výška` zůstává rovna poslední platné hodnotě.

#### 3-1-3- V řadě
`v řadě` určuje výherní počet v řadě.
Povolené hodnoty jsou celá čísla 1 až 40 včetně. Při zadání neplatné hodnoty se vstupní pole zbarví červeně a `v řadě` zůstává rovna poslední platné hodnotě.

### 3-2- Dynamičnost parametrů
Změna těchto hodnot se uplatní okamžitě. Není třeba restartování hry. 

Buňky se přidávají buď zprava (pokud došlo ke změně `šířky`), nebo zdola (změna `výšky` pole).

V případě, že dojde ke změně `v řadě`, pole se okamžitě začne procházet za účelem zjistit, zdali není po změně parametrů někaká řádka buněk výherní. Jestliže je výhra nalezena, je signalizována obvykle podle viz sekce `2-2-` a herní pole musí být resetováno pro novou hru.
Herní pole se kontroluje po řádcích, řádky zleva doprava. Je možné, že na herní desce bude více než jedna výherní řádka. Jelikož má však procházení desky svůj řád, vždy z možných výher vyplyne jedna prioritní.

## 4- Struktura

### 4-1- Versatilní a generické třídy a rozhraní
Součástí této aplikace je pár tříd a rozhraní, které jsou velmi široce použitelné. Tím je myšleno, že jejich použití není omezeno specificky pouze na tuto aplikaci. Naopak. Bez sebemenších úprav by stejně dobře posloužily v naprosto odlišném prostředí, což je činí velice versatilními. Právě z tohoto důvodu jsou umístěny ve složce nadřazené většině komponent aplikace. Zatímco značná část aplikace je umístěna ve složce `./src/app`, zmiňované třídy a rozhranní nachází své místo o řád výš ve `./src`. Toto umístění podtrhuje jejich podstatu být zvažovány spíše přídavnými moduly nežli nedílnou součástí aplikace (i když nezbytnou) a poukazuje a vybízí k jejich použití v jiných projektech.

#### 4-1-1- EventHandler (Event)
Viz dokumentace `./src/eventHandler/EVENTDOC.md`.

#### 4-1-2- StyleClassManagement
Viz dokumentace `./src/styleClassManagement/CLASSMANAGEMENTDOC.md`.

#### 4-1-3- InputBoxComponent
Tento komponent byl i přes jeho široké požití zařazen do složky `./src/app`. Jedná se o generický základ komponentu sloužícího jako textový vstupní bod. 
Je ale uzpůsoben tak, aby se psaný text přímo v komponentu převáděl na typ hodnoty určený stanovením typu `T`. Vždy ve chvíli, když je poupraven vstupní text, se ho komponent snaží převést do námi vyžadovaného formátu. Když např. chceme, aby byl text převáděn na čísla, skrze námi poskytnuté ověřovací a převáděcí funkce se komponent přesvědčí, zda zadaná hodnota je pouze číselná, a v tom případě ji převede do typu `number`. 
Ověřovací a převáděcí funkce se sice dají předat atributům odpovídajících jmen v HTML kontextu, ale nejdříve je vhodné komponent rozšířit a stanovit typ jeho hodnoty `T`. Při vytváření nového komponentu, který dědí z `InputBoxComponent`, můžeme využít možnosti definovat ověřovací a převáděcí funkce skrze jejich přepsání pomocí klíčového slova `override`. Tyto funkce jsou v záklaním typu `InputBoxComponnet` deklarovány, avšak nic nevykonávají.

Komponent `InputNumberComponent` dědí z `InputBoxComponent` a stanovuje typ `T` na number: `export class InputNumberComponent extends InputBoxComponent<number>`. Jde o komponent, jehož úkolem je převést do typu `number` zadaný text. Pokud je zadán jiný znak než číslice od 0 do 9, hodnota se převádět nebude a komponent zčervená, aby indikoval invalidní vstupní hodnotu.
Ověřovací a převáděcí funkce jsou přepsány, aby plnily svoje úkoly.
Pořád je však využito předávání funkcí skrze HTML atribut. Když je potřeba, aby byly upraveny všechny buňky hracího pole ve chvíli, kdy se změní číselná hodnota, předáme pole funkcí starajících se o vyřešení takové události do atributu `[subscriberFuncs]`. Vhodno podotknout, že o ošetření události se nám stará třída `Event`.

### 4-2- Hierarchie komponentů
Nejvýše ve struktuře najdeme komponent `AppComponent`, který je kontejnerem celé aplikace. Ta se skládá ze dvou hlavních částí. 

V levém horním rohu okna prohlížeče vždy najdeme seskupení komponentů `InputNumberComponent` sloužící jako vstupní bod pro vlastní parametry pravidel.

Druhou částí je samotné hrací pole, komponent `GridComponent`. Jedná se o tabulku všech buněk, pro lepší manipulaci ještě rozřazených do řádků `GridRow`. `GridRow` není komponentem, jedná se pouze o entitu zapozdřující jeden řádek buněk. Každá buňka má v tabulce unikátní souřadnice určené podle toho, v jakém řádku a sloupci se nachází, počínaje nulou. Je možné určitou změnu provést jak u jedné buňky, tak u výčtu buněk včetně celého pole. Pomocí metody `getCellByPos` v servisu `./src/app/grid/(grid.component).GridComponent` lze kdekoli provést změnu na určité buňce podle zadaných souřadnic. 
Členem komponentu `GridComponent` je dvoudimenzionální pole `grid`, jež obsahuje instance řádků `GridRow`, které se dále dají rozdělit na jednotlivé buňky `cell`.

#### 4-2-1- Role třídy `Cell`
I když by se mohlo zdát příhodné, že `Cell` by byla komponentem namísto pouhé třídy, při skutečnosti, jak je aplikace strukturována, by to bylo na obtíž. Buňky je totiž potřeba dynamicky generovat podle potřeby, změní-li se šířka nebo výška hracího pole. Zároveň je potřeba mít nepřetržitě přístup ke všem instancím buněk v hrací desce (např. scénář restartu hry: všem buňkám se musí nastavit výchozí počáteční hodnota).
Pomocí direktivy `ng-for` je možné jednoduše dosáhnout generování buněk závislého na velikosti určitého pole (v tomto případě tabulky, kde jsou použity dvě direktivy `ng-for`, jedna pro každou dimenzi). Při generování komponentů však automaticky nezískáme přístup k jejich instancím. Proto je na řadě kompromis. Komponent (dříve `CellComponent`) tak byl rozdělen na dvě části: třídu `Cell` a komponent `CellShellComponent`. 

`Cell` zapouzdřuje veškerou funkcionalitu buňky. Její instance vytváří generická metoda `adjustRow` v servisu `./src/app/grid/(grid.service).GridService` a okamžitě je zařadí do tabulky, kde získají pozici, která se používá jako primární unikátní klíč k identifikaci a přístupu k instancím `Cell`. 
Metoda `adjustRow` je generická, protože není určena k vytváření pouze instancí `Cell`. Když se ku příkladu změní výška hracího pole, je potřeba přidat celý řádek buněk. Řádek buňek tady funguje jako samostatná entita, a tak se jeho instance dá také vytvořit pomocí `adjustRow`. Dalo by se argumetovat, že se tím ve skutečnosti ztrácí důvod vytvářet samostatné buňky; při změně šířky by se přidal celý sloupec. Přidávání samostatných buněk má však co do činění s prioritou dimenzí tabulky (sloupec je níže než řádek), a proto když se změní šířka, ke každému řádku se přidá jedna buňka, což se jako celek dá nazývat 'sloupcem', ale z hlediska struktury je to nesmysl.

`CellChellComponent` funguje jako vizuální schránka `Cell`. Jedná se o komponent, jehož každá instance přechovává nanejvýš jednu instanci třídy `Cell` (pole může být i prázdné). Tento komponent je dynamicky generován pomocí direktivy `ng-for` podle tabulky s instancemi `Cell`, jež je součástí komponentu `./src/app/grid/(grid.component).GridComponent` (samotné hrací desky).

Tyto dvě části složeny dohromady tvoří buňku hracího pole. Obě strany spolu navzájem komunikují; na vizuální reprezentaci lze zachytit událost kliknutí, se kterou naloží logická stránka, a byly-li kliknutím vynuceny vizuální změny nebo chování uživatelského rozhraní, logická část tyto změny vymůže na stránce vizuální.

## 5- Dodatek a komentáře
Při vytváření aplikace byla v malé míře použita umělá inteligence pro řešení občasných specifických lokálních problémů. Struktura aplikace je však umělou inteligencí nepotřísněná/nepožehnaná.
To samé platí o veškeré dokumentaci, na které nemá AI sebemenší podíl.

Tento projekt byl započat 31.12.2023 jako můj první projekt používající framework `Angular`.

Github repozitář:
https://github.com/MartinVlcekNot/pisqworky-angular-app.git

Martin Vlček
