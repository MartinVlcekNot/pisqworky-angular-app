// Rozhraní 'IboundsStyle' u objektu určuje, že daný objekt svůj styl dynamicky mění podle určitých parametrů.

export interface IBoundsStyle{

  // zápis stylu v reálném čase podle určitých parametrů ve css formě "vlastnost1: hodnota1; vlastnost2: hodnota2; ... "
  get boundsStyle(): string;
}
