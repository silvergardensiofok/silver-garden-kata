
"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type LangCode = "hu-HU" | "en-US" | "de-DE" | "it-IT" | "pl-PL" | "uk-UA";
type LocalizedText = Record<LangCode, string>;

type RecognitionAlternative = {
  transcript: string;
};

type RecognitionResultLike = {
  0: RecognitionAlternative;
  length: number;
  isFinal?: boolean;
};

type RecognitionResultListLike = {
  0: RecognitionResultLike;
  length: number;
};

type SpeechRecognitionEventLike = Event & {
  results: RecognitionResultListLike;
};

type SpeechRecognitionErrorEventLike = Event & {
  error?: string;
};

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous?: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort?: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type MenuItem = {
  id: string;
  label: LocalizedText;
  answer: LocalizedText;
};

type RouteInfo = {
  label: LocalizedText;
  answer: LocalizedText;
};

const RECEPTION_WHATSAPP_PHONE = "36704089437";
const CONTACT_EMAIL = "info@silvergarden.hu";
const CONTACT_PHONE_DISPLAY = "+36 70 408 9437";

const tr = (
  hu: string,
  en: string,
  de: string,
  it: string,
  pl: string,
  uk: string
): LocalizedText => ({
  "hu-HU": hu,
  "en-US": en,
  "de-DE": de,
  "it-IT": it,
  "pl-PL": pl,
  "uk-UA": uk,
});

const getText = (text: LocalizedText, lang: LangCode) => text[lang] || text["hu-HU"];

const normalizeForMatch = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const replaceWords = (input: string, replacements: Array<[RegExp, string]>) => {
  let result = input;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
};

const mapNumberWordsToDigits = (text: string) => {
  return replaceWords(` ${normalizeForMatch(text)} `, [
    [/\bnullas\b/g, " 0 "],
    [/\bzero\b/g, " 0 "],
    [/\begy(es)?\b/g, " 1 "],
    [/\bone\b/g, " 1 "],
    [/\beins\b/g, " 1 "],
    [/\buno\b/g, " 1 "],
    [/\bjeden\b/g, " 1 "],
    [/\bodyn\b/g, " 1 "],
    [/\bodna\b/g, " 1 "],
    [/\bодин\b/g, " 1 "],
    [/\bодна\b/g, " 1 "],
    [/\bketto\b/g, " 2 "],
    [/\bkettes\b/g, " 2 "],
    [/\btwo\b/g, " 2 "],
    [/\bzwei\b/g, " 2 "],
    [/\bdue\b/g, " 2 "],
    [/\bdwa\b/g, " 2 "],
    [/\bdwie\b/g, " 2 "],
    [/\bдва\b/g, " 2 "],
    [/\bharom\b/g, " 3 "],
    [/\bharmas\b/g, " 3 "],
    [/\bthree\b/g, " 3 "],
    [/\bdrei\b/g, " 3 "],
    [/\btre\b/g, " 3 "],
    [/\btrzy\b/g, " 3 "],
    [/\bтри\b/g, " 3 "],
    [/\bnegy\b/g, " 4 "],
    [/\bnegyes\b/g, " 4 "],
    [/\bfour\b/g, " 4 "],
    [/\bvier\b/g, " 4 "],
    [/\bquattro\b/g, " 4 "],
    [/\bcztery\b/g, " 4 "],
    [/\bчотири\b/g, " 4 "],
    [/\bot\b/g, " 5 "],
    [/\botos\b/g, " 5 "],
    [/\bfive\b/g, " 5 "],
    [/\bfunf\b/g, " 5 "],
    [/\bcinque\b/g, " 5 "],
    [/\bpiec\b/g, " 5 "],
    [/\bпять\b/g, " 5 "],
    [/\bhat\b/g, " 6 "],
    [/\bhatos\b/g, " 6 "],
    [/\bsix\b/g, " 6 "],
    [/\bsechs\b/g, " 6 "],
    [/\bsei\b/g, " 6 "],
    [/\bszesc\b/g, " 6 "],
    [/\bшість\b/g, " 6 "],
    [/\bhet\b/g, " 7 "],
    [/\bhetes\b/g, " 7 "],
    [/\bseven\b/g, " 7 "],
    [/\bsieben\b/g, " 7 "],
    [/\bsette\b/g, " 7 "],
    [/\bsiedem\b/g, " 7 "],
    [/\bсім\b/g, " 7 "],
    [/\bnyolc\b/g, " 8 "],
    [/\bnyolcas\b/g, " 8 "],
    [/\beight\b/g, " 8 "],
    [/\bacht\b/g, " 8 "],
    [/\botto\b/g, " 8 "],
    [/\bosiem\b/g, " 8 "],
    [/\bвісім\b/g, " 8 "],
  ]).replace(/\s+/g, " ").trim();
};

const containsAny = (text: string, patterns: string[]) => patterns.some((p) => text.includes(p));

const roomRoutes: Record<number, RouteInfo> = {
  1: { label: tr("Szoba 1","Room 1","Zimmer 1","Camera 1","Pokój 1","Кімната 1"), answer: tr("Az 1-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Balra az első szoba az 1-es szoba.","To find room 1, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The first room on the left is room 1.","Um Zimmer 1 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das erste Zimmer links ist Zimmer 1.","Per trovare la camera 1, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La prima camera a sinistra è la camera 1.","Aby znaleźć pokój 1, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Pierwszy pokój po lewej stronie to pokój 1.","Щоб знайти кімнату 1, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Перша кімната ліворуч — це кімната 1.") },
  2: { label: tr("Szoba 2","Room 2","Zimmer 2","Camera 2","Pokój 2","Кімната 2"), answer: tr("A 2-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Balra a második szoba a 2-es szoba.","To find room 2, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The second room on the left is room 2.","Um Zimmer 2 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das zweite Zimmer links ist Zimmer 2.","Per trovare la camera 2, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La seconda camera a sinistra è la camera 2.","Aby znaleźć pokój 2, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Drugi pokój po lewej stronie to pokój 2.","Щоб знайти кімнату 2, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Друга кімната ліворуч — це кімната 2.") },
  3: { label: tr("Szoba 3","Room 3","Zimmer 3","Camera 3","Pokój 3","Кімната 3"), answer: tr("A 3-as szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Balra a harmadik szoba a 3-as szoba.","To find room 3, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The third room on the left is room 3.","Um Zimmer 3 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das dritte Zimmer links ist Zimmer 3.","Per trovare la camera 3, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La terza camera a sinistra è la camera 3.","Aby znaleźć pokój 3, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Trzeci pokój po lewej stronie to pokój 3.","Щоб знайти кімнату 3, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Третя кімната ліворуч — це кімната 3.") },
  4: { label: tr("Szoba 4","Room 4","Zimmer 4","Camera 4","Pokój 4","Кімната 4"), answer: tr("A 4-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Balra a negyedik szoba a 4-es szoba.","To find room 4, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The fourth room on the left is room 4.","Um Zimmer 4 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das vierte Zimmer links ist Zimmer 4.","Per trovare la camera 4, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La quarta camera a sinistra è la camera 4.","Aby znaleźć pokój 4, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Czwarty pokój po lewej stronie to pokój 4.","Щоб знайти кімнату 4, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Четверта кімната ліворуч — це кімната 4.") },
  5: { label: tr("Szoba 5","Room 5","Zimmer 5","Camera 5","Pokój 5","Кімната 5"), answer: tr("Az 5-ös szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Jobbra a második szoba az 5-ös szoba.","To find room 5, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The second room on the right is room 5.","Um Zimmer 5 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das zweite Zimmer rechts ist Zimmer 5.","Per trovare la camera 5, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La seconda camera a destra è la camera 5.","Aby znaleźć pokój 5, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Drugi pokój po prawej stronie to pokój 5.","Щоб знайти кімнату 5, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Друга кімната праворуч — це кімната 5.") },
  6: { label: tr("Szoba 6","Room 6","Zimmer 6","Camera 6","Pokój 6","Кімната 6"), answer: tr("A 6-os szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Jobbra a harmadik szoba a 6-os szoba.","To find room 6, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The third room on the right is room 6.","Um Zimmer 6 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das dritte Zimmer rechts ist Zimmer 6.","Per trovare la camera 6, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La terza camera a destra è la camera 6.","Aby znaleźć pokój 6, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Trzeci pokój po prawej stronie to pokój 6.","Щоб знайти кімнату 6, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Третя кімната праворуч — це кімната 6.") },
  7: { label: tr("Szoba 7","Room 7","Zimmer 7","Camera 7","Pokój 7","Кімната 7"), answer: tr("A 7-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Jobbra a negyedik szoba a 7-es szoba.","To find room 7, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The fourth room on the right is room 7.","Um Zimmer 7 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das vierte Zimmer rechts ist Zimmer 7.","Per trovare la camera 7, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La quarta camera a destra è la camera 7.","Aby znaleźć pokój 7, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Czwarty pokój po prawej stronie to pokój 7.","Щоб знайти кімнату 7, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Четверта кімната праворуч — це кімната 7.") },
  8: { label: tr("Szoba 8","Room 8","Zimmer 8","Camera 8","Pokój 8","Кімната 8"), answer: tr("A 8-as szobát úgy találja meg, hogy tovább halad a recepció mellett. Jobbra a 8-as felirat jelzi a szobát. A kulcsot a zárban találja.","To find room 8, continue past the reception. On the right, the number 8 marks the room. You will find the key in the lock.","Um Zimmer 8 zu finden, gehen Sie an der Rezeption vorbei weiter. Rechts zeigt die Nummer 8 das Zimmer an. Den Schlüssel finden Sie im Schloss.","Per trovare la camera 8, continui oltre la reception. Sulla destra il numero 8 indica la camera. Troverà la chiave nella serratura.","Aby znaleźć pokój 8, proszę iść dalej obok recepcji. Po prawej stronie numer 8 oznacza pokój. Klucz znajduje się w zamku.","Щоб знайти кімнату 8, пройдіть далі повз рецепцію. Праворуч номер 8 позначає кімнату. Ключ ви знайдете в замку.") },
};

const apartmentRoutes: Record<number, RouteInfo> = {
  1: { label: tr("Apartman 1","Apartment 1","Apartment 1","Appartamento 1","Apartament 1","Апартамент 1"), answer: tr("Az Apartman 1-et úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Jobb oldalon találja az utolsó előtti ajtót A 1 felirattal. A kulcs a zárban van.","To find apartment 1, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. On the right side you will find the second-to-last door marked A 1. The key is in the lock.","Um Apartment 1 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Auf der rechten Seite finden Sie die vorletzte Tür mit der Aufschrift A 1. Der Schlüssel steckt im Schloss.","Per trovare l'appartamento 1, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. Sul lato destro troverà la penultima porta con la scritta A 1. La chiave è nella serratura.","Aby znaleźć apartament 1, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Po prawej stronie znajdzie Pan przedostatnie drzwi oznaczone A 1. Klucz jest w zamku.","Щоб знайти апартамент 1, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Праворуч ви побачите передостанні двері з написом A 1. Ключ у замку.") },
  2: { label: tr("Apartman 2","Apartment 2","Apartment 2","Appartamento 2","Apartament 2","Апартамент 2"), answer: tr("Az Apartman 2-t úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Bal oldalon találja az utolsó előtti ajtót A 2 felirattal. A kulcs a zárban van.","To find apartment 2, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. On the left side you will find the second-to-last door marked A 2. The key is in the lock.","Um Apartment 2 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Auf der linken Seite finden Sie die vorletzte Tür mit der Aufschrift A 2. Der Schlüssel steckt im Schloss.","Per trovare l'appartamento 2, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. Sul lato sinistro troverà la penultima porta con la scritta A 2. La chiave è nella serratura.","Aby znaleźć apartament 2, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Po lewej stronie znajdzie Pan przedostatnie drzwi oznaczone A 2. Klucz jest w zamku.","Щоб знайти апартамент 2, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Ліворуч ви побачите передостанні двері з написом A 2. Ключ у замку.") },
  3: { label: tr("Apartman 3","Apartment 3","Apartment 3","Appartamento 3","Apartament 3","Апартамент 3"), answer: tr("Az Apartman 3-at úgy találja meg, hogy tovább halad a recepció mellett. Jobbra az A 3 felirat jelzi a szobát. A kulcsot a zárban találja.","To find apartment 3, continue past the reception. On the right, the A 3 sign marks the room. You will find the key in the lock.","Um Apartment 3 zu finden, gehen Sie an der Rezeption vorbei weiter. Rechts zeigt die Aufschrift A 3 das Zimmer an. Den Schlüssel finden Sie im Schloss.","Per trovare l'appartamento 3, continui oltre la reception. Sulla destra l'insegna A 3 indica la camera. Troverà la chiave nella serratura.","Aby znaleźć apartament 3, proszę iść dalej obok recepcji. Po prawej stronie oznaczenie A 3 wskazuje pokój. Klucz znajduje się w zamku.","Щоб знайти апартамент 3, пройдіть далі повз рецепцію. Праворуч napis A 3 позначає кімнату. Ключ ви знайдете в замку.") },
  4: { label: tr("Apartman 4","Apartment 4","Apartment 4","Appartamento 4","Apartament 4","Апартамент 4"), answer: tr("Az Apartman 4-et úgy találja meg, hogy megkerüli az épületet. Megkeresi az A 4-es feliratot. A kulcs a zárba be van készítve.","To find apartment 4, walk around the building. Look for the A 4 sign. The key is already placed in the lock.","Um Apartment 4 zu finden, gehen Sie um das Gebäude herum. Suchen Sie nach der Aufschrift A 4. Der Schlüssel steckt bereits im Schloss.","Per trovare l'appartamento 4, faccia il giro dell'edificio. Cerchi l'insegna A 4. La chiave è già inserita nella serratura.","Aby znaleźć apartament 4, proszę obejść budynek. Proszę szukać oznaczenia A 4. Klucz jest już włożony do zamka.","Щоб знайти апартамент 4, обійдіть будівлю. Знайдіть позначення A 4. Ключ уже вставлено в замок.") },
  5: { label: tr("Apartman 5","Apartment 5","Apartment 5","Appartamento 5","Apartament 5","Апартамент 5"), answer: tr("Az Apartman 5-öt úgy találja meg, hogy tovább halad a recepció mellett. Az épület hátsó felénél jobbra fordul. A lépcsővel szemben találja az A 5 feliratot. A kulcs a zárba be van készítve.","To find apartment 5, continue past the reception. At the back side of the building, turn right. Opposite the stairs you will find the A 5 sign. The key is already placed in the lock.","Um Apartment 5 zu finden, gehen Sie an der Rezeption vorbei weiter. Auf der Rückseite des Gebäudes biegen Sie rechts ab. Gegenüber der Treppe finden Sie die Aufschrift A 5. Der Schlüssel steckt bereits im Schloss.","Per trovare l'appartamento 5, continui oltre la reception. Sul retro dell'edificio giri a destra. Di fronte alle scale troverà l'insegna A 5. La chiave è già inserita nella serratura.","Aby znaleźć apartament 5, proszę iść dalej obok recepcji. Z tyłu budynku proszę skręcić w prawo. Naprzeciw schodów znajdzie Pan oznaczenie A 5. Klucz jest już włożony do zamka.","Щоб знайти апартамент 5, пройдіть далі повз рецепцію. На задній стороні будівлі поверніть праворуч. Навпроти сходів ви знайдете позначення A 5. Ключ уже вставлено в замок.") },
};

const relaxRoutes: Record<string, RouteInfo> = {
  "1": { label: tr("Relax 1","Relax 1","Relax 1","Relax 1","Relax 1","Relax 1"), answer: tr("A Relax 1 szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett egy másik épülethez. Megkerüli a medence felől az épületet. Ott találja az R 1 feliratot. A kulcsot a zárban találja.","To find Relax 1, walk towards the back and pass the sauna to another building. Walk around the building from the pool side. There you will find the R 1 sign. The key is in the lock.","Um Relax 1 zu finden, gehen Sie nach hinten und an der Sauna vorbei zu einem anderen Gebäude. Gehen Sie auf der Poolseite um das Gebäude herum. Dort finden Sie die Aufschrift R 1. Der Schlüssel steckt im Schloss.","Per trovare Relax 1, vada verso il retro e passi accanto alla sauna fino a un altro edificio. Faccia il giro dell'edificio dal lato della piscina. Lì troverà l'insegna R 1. La chiave è nella serratura.","Aby znaleźć Relax 1, proszę iść do tyłu i minąć saunę w kierunku drugiego budynku. Proszę obejść budynek od strony basenu. Tam znajdzie Pan oznaczenie R 1. Klucz jest w zamku.","Щоб знайти Relax 1, пройдіть назад повз сауну до іншої будівлі. Обійдіть будівлю з боку басейну. Там ви знайдете позначення R 1. Ключ у замку.") },
  "2": { label: tr("Relax 2","Relax 2","Relax 2","Relax 2","Relax 2","Relax 2"), answer: tr("A Relax 2 szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett egy másik épülethez. Megkerüli a medence felől az épületet. Ott találja az R 2 feliratot. A kulcsot a zárban találja.","To find Relax 2, walk towards the back and pass the sauna to another building. Walk around the building from the pool side. There you will find the R 2 sign. The key is in the lock.","Um Relax 2 zu finden, gehen Sie nach hinten und an der Sauna vorbei zu einem anderen Gebäude. Gehen Sie auf der Poolseite um das Gebäude herum. Dort finden Sie die Aufschrift R 2. Der Schlüssel steckt im Schloss.","Per trovare Relax 2, vada verso il retro e passi accanto alla sauna fino a un altro edificio. Faccia il giro dell'edificio dal lato della piscina. Lì troverà l'insegna R 2. La chiave è nella serratura.","Aby znaleźć Relax 2, proszę iść do tyłu i minąć saunę w kierunku drugiego budynku. Proszę obejść budynek od strony basenu. Tam znajdzie Pan oznaczenie R 2. Klucz jest w zamku.","Щоб знайти Relax 2, пройдіть назад повз сауну до іншої будівлі. Обійдіть будівлю з боку басейну. Там ви знайдете позначення R 2. Ключ у замку.") },
  "3": { label: tr("Relax 3","Relax 3","Relax 3","Relax 3","Relax 3","Relax 3"), answer: tr("A Relax 3 szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett egy másik épülethez. Megkerüli a medence felől az épületet. Ott találja az R 3 feliratot. A kulcsot a zárban találja.","To find Relax 3, walk towards the back and pass the sauna to another building. Walk around the building from the pool side. There you will find the R 3 sign. The key is in the lock.","Um Relax 3 zu finden, gehen Sie nach hinten und an der Sauna vorbei zu einem anderen Gebäude. Gehen Sie auf der Poolseite um das Gebäude herum. Dort finden Sie die Aufschrift R 3. Der Schlüssel steckt im Schloss.","Per trovare Relax 3, vada verso il retro e passi accanto alla sauna fino a un altro edificio. Faccia il giro dell'edificio dal lato della piscina. Lì troverà l'insegna R 3. La chiave è nella serratura.","Aby znaleźć Relax 3, proszę iść do tyłu i minąć saunę w kierunku drugiego budynku. Proszę obejść budynek od strony basenu. Tam znajdzie Pan oznaczenie R 3. Klucz jest w zamku.","Щоб знайти Relax 3, пройдіть назад повз сауну до іншої будівлі. Обійдіть будівлю з боку басейну. Там ви знайдете позначення R 3. Ключ у замку.") },
  "4": { label: tr("Relax 4","Relax 4","Relax 4","Relax 4","Relax 4","Relax 4"), answer: tr("A Relax 4 szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett. Egy másik épülethez ér. Ott találja az R 4 feliratot. A kulcsot a zárban találja.","To find Relax 4, walk towards the back and pass the sauna. You will arrive at another building. There you will find the R 4 sign. The key is in the lock.","Um Relax 4 zu finden, gehen Sie nach hinten und an der Sauna vorbei. Sie kommen zu einem anderen Gebäude. Dort finden Sie die Aufschrift R 4. Der Schlüssel steckt im Schloss.","Per trovare Relax 4, vada verso il retro e passi accanto alla sauna. Arriverà a un altro edificio. Lì troverà l'insegna R 4. La chiave è nella serratura.","Aby znaleźć Relax 4, proszę iść do tyłu i minąć saunę. Dojdzie Pan do drugiego budynku. Tam znajdzie Pan oznaczenie R 4. Klucz jest w zamku.","Щоб знайти Relax 4, пройдіть назад повз сауну. Ви дійдете до іншої будівлі. Там ви знайдете позначення R 4. Ключ у замку.") },
  premium: { label: tr("Relax Prémium","Relax Premium","Relax Premium","Relax Premium","Relax Premium","Relax Premium"), answer: tr("A Relax Prémium szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett egy másik épülethez. Felmegy a lépcsőn. Ott találja az R P feliratot. A kulcsot a zárban találja.","To find Relax Premium, walk towards the back and pass the sauna to another building. Go up the stairs. There you will find the R P sign. The key is in the lock.","Um Relax Premium zu finden, gehen Sie nach hinten und an der Sauna vorbei zu einem anderen Gebäude. Gehen Sie die Treppe hinauf. Dort finden Sie die Aufschrift R P. Der Schlüssel steckt im Schloss.","Per trovare Relax Premium, vada verso il retro e passi accanto alla sauna fino a un altro edificio. Salga le scale. Lì troverà l'insegna R P. La chiave è nella serratura.","Aby znaleźć Relax Premium, proszę iść do tyłu i minąć saunę w kierunku drugiego budynku. Proszę wejść po schodach. Tam znajdzie Pan oznaczenie R P. Klucz jest w zamku.","Щоб знайти Relax Premium, пройдіть назад повз сауну до іншої будівлі. Підніміться сходами. Там ви знайдете позначення R P. Ключ у замку.") },
};

const faqItems: MenuItem[] = [
  { id: "reggeli", label: tr("Reggeli","Breakfast","Frühstück","Colazione","Śniadanie","Сніданок"), answer: tr("A reggeli minden nap 8:00 és 10:00 között érhető el. A reggeli ára 8 euro per fő per nap. A reggelit általában 4 féle ételválasztékból lehet választani, jellemzően tojásos ételek. A csomag tartalmaz egy pohár narancslevet és egy kávét is.","Breakfast is available every day between 8:00 and 10:00. The price is 8 euro per person per day. Breakfast is served à la carte: usually you can choose from 4 options, typically egg dishes. The package includes a glass of orange juice and a coffee.","Das Frühstück ist täglich zwischen 8:00 und 10:00 Uhr verfügbar. Der Preis beträgt 8 Euro pro Person und Tag. Das Frühstück wird à la carte serviert: in der Regel können Sie aus 4 Optionen wählen, meist Eierspeisen. Im Preis sind ein Glas Orangensaft und ein Kaffee enthalten.","La colazione è disponibile ogni giorno dalle 8:00 alle 10:00. Il prezzo è di 8 euro a persona al giorno. La colazione viene servita à la carte: di solito si può scegliere tra 4 opzioni, generalmente piatti a base di uova. Il pacchetto include un bicchiere di succo d’arancia e un caffè.","Śniadanie jest dostępne codziennie od 8:00 do 10:00. Cena wynosi 8 euro za osobę za dzień. Śniadanie serwujemy à la carte: zwykle można wybrać z 4 opcji, najczęściej potraw z jajek. W pakiecie jest sok pomarańczowy i kawa.","Сніданок доступний щодня з 8:00 до 10:00. Вартість — 8 євро з особи на день. Сніданок подаємо à la carte: зазвичай можна обрати з 4 варіантів, переважно страв із яєць. У пакет входить апельсиновий сік і кава.") },
  { id: "wifi", label: tr("Wifi","Wifi","WLAN","Wifi","Wifi","Wi‑Fi"), answer: tr("A wifi neve SilverGarden. A jelszó balatonlive, kisbetűvel, egybeírva.","The wifi name is SilverGarden. The password is balatonlive in lowercase, written together.","Das WLAN heißt SilverGarden. Das Passwort ist balatonlive, klein geschrieben und zusammen.","Il nome del wifi è SilverGarden. La password è balatonlive, in minuscolo e senza spazi.","Nazwa wifi to SilverGarden. Hasło to balatonlive, małymi literami, bez spacji.","Назва Wi‑Fi — SilverGarden. Пароль — balatonlive, маленькими літерами, без пробілів.") },
  { id: "parking", label: tr("Parkolás-Elektromos töltés","Parking-electric charge","Parken-elektrische Ladung","Parcheggio-carica elettrica","Parking-ładunek elektryczny","Паркування-електричний заряд"), answer: tr("A vendégek számára ingyenes parkoló áll rendelkezésre az épület előtt az utcai parkolóban. Az elektromos autó töltéshez mindenképpen keresse kollégánkat.","Free parking is available for guests in the street parking area in front of the building. For electric car charging, be sure to contact our colleague.","Für Gäste stehen kostenlose Parkplätze vor dem Gebäude auf den Straßenparkplätzen zur Verfügung. Für das Laden von Elektroautos wenden Sie sich bitte an unseren Kollegen.","Per gli ospiti è disponibile un parcheggio gratuito davanti all'edificio, nei posti auto sulla strada. Per la ricarica delle auto elettriche, si prega di contattare il nostro collega.","Dla gości dostępny jest bezpłatny parking przed budynkiem, na miejscach parkingowych przy ulicy. Jeśli interesują Cię kwestie związane z ładowaniem samochodów elektrycznych, koniecznie skontaktuj się z naszym kolegą.","Для гостей доступне безкоштовне паркування перед будівлею на вуличних місцях. Для заряджання електромобіля зверніться до нашого колеги.") },
  { id: "wellness", label: tr("Wellnesz","Wellness","Wellness","Wellness","Wellness","Велнес"), answer: tr("A wellnesz a vendégek számára díj ellenében érhető el. A szauna használat 4000 forint per fő, 3 órára. Megrendeléstől számított 2 órán belül használható. A fürdőmedence ingyenesen használható május 1-től szeptember 30-ig.","The wellness area is available to guests for an extra fee. Sauna use costs 4000 forints per person for 3 hours. It can be used within 2 hours after ordering. The swimming pool is free to use from May 1st to September 30th.","Der Wellnessbereich steht den Gästen gegen Gebühr zur Verfügung. Die Saunanutzung kostet 4000 Forint pro Person für 3 Stunden. Sie kann innerhalb von 2 Stunden nach der Bestellung genutzt werden. Die Nutzung des Schwimmbads ist vom 1. Mai bis zum 30. September kostenlos.","L'area wellness è disponibile per gli ospiti a pagamento. L'uso della sauna costa 4000 fiorini a persona per 3 ore. È utilizzabile entro 2 ore dalla prenotazione. La piscina è gratuita dal 1° maggio al 30 settembre.","Strefa wellness jest dostępna dla gości za dodatkową opłatą. Korzystanie z sauny kosztuje 4000 forintów za osobę na 3 godziny. Można z niej skorzystać w ciągu 2 godzin od zamówienia. Z basenu można korzystać bezpłatnie od 1 maja do 30 września.","Велнес-зона доступна для гостей за додаткову плату. Користування сауною коштує 4000 форинтів з особи за 3 години. Нею можна скористатися протягом 2 годин після замовлення. Басейном можна користуватися безкоштовно з 1 травня по 30 вересня.") },
  { id: "pool", label: tr("Medence","Pool","Pool","Piscina","Basen","Басейн"), answer: tr("A medence minden nap 9:00 és 21:00 között használható.","The pool can be used every day between 9:00 and 21:00.","Der Pool kann täglich zwischen 9:00 und 21:00 Uhr genutzt werden.","La piscina può essere utilizzata ogni giorno dalle 9:00 alle 21:00.","Z basenu można korzystać codziennie w godzinach od 9:00 do 21:00.","Басейном можна користуватися щодня з 9:00 до 21:00.") },
  { id: "checkout", label: tr("Kijelentkezés","Check-out","Check-out","Check-out","Wymeldowanie","Виїзд"), answer: tr("A kijelentkezés legkésőbb 10:00 óráig lehetséges. Megkérjük vendégeinket, hogy a kulcsot hagyják a szobaajtóban.","Check-out is possible until 10:00 at the latest. Please leave the key in the room door.","Der Check-out ist spätestens bis 10:00 Uhr möglich. Wir bitten unsere Gäste, den Schlüssel in der Zimmertür zu lassen.","Il check-out è possibile al più tardi entro le 10:00. Chiediamo gentilmente agli ospiti di lasciare la chiave nella porta della camera.","Wymeldowanie jest możliwe najpóźniej do godziny 10:00. Prosimy gości o pozostawienie klucza w drzwiach pokoju.","Виїзд можливий не пізніше 10:00. Просимо гостей залишити ключ у дверях номера.") },
  { id: "checkin", label: tr("Bejelentkezés","Check-in","Check-in","Check-in","Zameldowanie","Заселення"), answer: tr("A bejelentkezés 14:00 órától lehetséges.","Check-in is possible from 14:00.","Der Check-in ist ab 14:00 Uhr möglich.","Il check-in è possibile dalle 14:00.","Zameldowanie jest możliwe od godziny 14:00.","Заселення можливе з 14:00.") },
  { id: "gate", label: tr("Kapu","Gate","Tor","Cancello","Brama","Ворота"), answer: tr("A kapu éjszaka nyitva van. Bármikor kulcs nélkül be lehet jutni.","The gate is open at night. You can enter at any time without a key.","Das Tor ist nachts offen. Sie können jederzeit ohne Schlüssel eintreten.","Il cancello è aperto di notte. Si può entrare in qualsiasi momento senza chiave.","Brama jest otwarta w nocy. Można wejść w każdej chwili bez klucza.","Ворота вночі відкриті. Ви можете зайти будь-коли без ключа.") },
  { id: "rules", label: tr("Házirend","House rules","Hausordnung","Regole della casa","Zasady domu","Правила"), answer: tr("Házirend: Megkérjük vendégeinket, hogy este 21 óra után mellőzzék a hangos tevékenységet, különösen a zenehallgatást. A medence teraszt 21:30 után szigorúan tilos használni, illetve ott összejövetelt tartani. A medence 9:00 és 21:00 között használható. Üveg poharat a kertben használni tilos. A kültéri eszközöket használat után kérjük tisztán tartani. A hulladékot és az ételmaradékot a tárolókonténerbe kérjük kiüríteni.","House rules: We ask our guests to refrain from loud activities after 9:00 PM, especially listening to music. It is strictly forbidden to use the pool terrace after 9:30 PM or to hold gatherings there. The pool can be used between 9:00 AM and 9:00 PM. Glass cups are not allowed in the garden. Please keep outdoor equipment clean after use. Please dispose of waste and food leftovers in the storage container.","Hausordnung: Wir bitten unsere Gäste, nach 21:00 Uhr auf laute Aktivitäten zu verzichten, insbesondere auf Musik. Die Nutzung der Poolterrasse nach 21:30 Uhr sowie Versammlungen dort sind strengstens verboten. Der Pool kann zwischen 9:00 und 21:00 Uhr genutzt werden. Gläser sind im Garten nicht erlaubt. Bitte halten Sie die Außengeräte nach Gebrauch sauber. Bitte entsorgen Sie Abfall und Speisereste im Container.","Regole della casa: Chiediamo gentilmente ai nostri ospiti di evitare attività rumorose dopo le 21:00, in particolare la musica. È severamente vietato utilizzare la terrazza della piscina dopo le 21:30 o organizzare raduni al suo interno. La piscina può essere utilizzata dalle 9:00 alle 21:00. È vietato usare bicchieri di vetro in giardino. Si prega di mantenere pulite le attrezzature esterne dopo l’uso. Si prega di gettare rifiuti e avanzi nel contenitore.","Zasady domu: Prosimy naszych gości o powstrzymanie się od głośnych zachowań po godzinie 21:00, szczególnie od słuchania muzyki. Korzystanie z tarasu basenowego po godzinie 21:30 oraz organizowanie tam zgromadzeń jest surowo zabronione. Z basenu można korzystać w godzinach 9:00-21:00. Szklane kubki są zabronione w ogrodzie. Prosimy o utrzymanie sprzętu zewnętrznego w czystości po użyciu. Odpady i resztki jedzenia prosimy wyrzucać do pojemnika.","Правила проживання: Просимо наших гостей утримуватися від гучних заходів після 21:00, особливо від музики. Суворо заборонено користуватися терасою біля басейну після 21:30 або проводити там зібрання. Басейном можна користуватися з 9:00 до 21:00. Скляний посуд у саду заборонений. Будь ласка, тримайте в чистоті вуличне обладнання після використання. Сміття та залишки їжі викидайте в контейнер.") },
  { id: "pet", label: tr("Kisállat","Pet","Haustier","Animale domestico","Zwierzę domowe","Домашня тварина"), answer: tr("Kisállat felár ellenében, előzetes bejelentéssel behozható. Ár: 10 euro per éj. Nem bejelentett kisállat után extraköltséget számítunk fel.","Pets can be brought with prior notice for an extra fee. Price: 10 euro per night. Extra charges apply for undeclared pets.","Haustiere können nach vorheriger Anmeldung gegen Aufpreis mitgebracht werden. Preis: 10 Euro pro Nacht. Für nicht angemeldete Haustiere wird ein Aufpreis berechnet.","Gli animali domestici possono essere portati con preavviso e con supplemento. Prezzo: 10 euro a notte. Per animali non dichiarati verrà addebitato un costo extra.","Zwierzęta domowe można przywieźć po wcześniejszym zgłoszeniu za dodatkową opłatą. Cena: 10 euro za noc. Za niezgłoszone zwierzęta naliczana jest dodatkowa opłata.","Домашніх тварин можна привозити після попереднього повідомлення за додаткову плату. Ціна: 10 євро за ніч. За незаявлених тварин стягується додаткова плата.") },
];

const extraVoiceItems: MenuItem[] = [
  { id: "greeting", label: tr("Köszönés","Greeting","Begrüßung","Saluto","Powitanie","Вітання"), answer: tr("Szia! Kata vagyok, a Silver Garden virtuális recepciósa. Miben segíthetek?","Hello! I'm Kata, the Silver Garden virtual receptionist. How can I help?","Hallo! Ich bin Kata, die virtuelle Rezeptionistin von Silver Garden. Wie kann ich helfen?","Ciao! Sono Kata, la receptionist virtuale di Silver Garden. Come posso aiutarti?","Cześć! Jestem Kata, wirtualna recepcjonistka Silver Garden. W czym mogę pomóc?","Привіт! Я Ката, віртуальна адміністраторка Silver Garden. Чим можу допомогти?") },
  { id: "nearby", label: tr("Környék","Nearby","Umgebung","Dintorni","Okolica","Поруч"), answer: tr("A környéken ajánljuk a Valhalla Bistrót, a Kiskert Éttermet és a Silver Éttermet. Bevásárlás: a PAR üzlet körülbelül 100 méterre található, a Lidl pedig körülbelül 8 perc sétára van. A gyógyszertár a Lidl mellett található. A strandot a parkoló bal oldalánál induló levezető úton körülbelül 2 perc alatt éri el.","Nearby we recommend Valhalla Bistro, Kiskert Restaurant and Silver Restaurant. For shopping, PAR store is about 100 meters away and Lidl is about 8 minutes away on foot. The pharmacy is next to Lidl. The beach can be reached in about 2 minutes via the path on the left side of the parking area.","In der Nähe empfehlen wir das Valhalla Bistro, das Kiskert Restaurant und das Silver Restaurant. Einkaufsmöglichkeiten: Das PAR-Geschäft ist etwa 100 Meter entfernt und Lidl etwa 8 Minuten zu Fuß. Die Apotheke befindet sich neben Lidl. Den Strand erreichen Sie in etwa 2 Minuten über den Weg links vom Parkplatz.","Nei dintorni consigliamo Valhalla Bistro, Kiskert Restaurant e Silver Restaurant. Per fare la spesa, il negozio PAR è a circa 100 metri e Lidl a circa 8 minuti a piedi. La farmacia si trova accanto al Lidl. La spiaggia è raggiungibile in circa 2 minuti tramite il sentiero a sinistra del parcheggio.","W pobliżu polecamy Valhalla Bistro, restaurację Kiskert oraz Silver Restaurant. Sklep PAR znajduje się około 100 metrów stąd, a Lidl około 8 minut spacerem. Apteka znajduje się obok Lidla. Na plażę dojdziesz w około 2 minuty ścieżką po lewej stronie parkingu.","Поруч рекомендуємо Valhalla Bistro, ресторан Kiskert і Silver Restaurant. Магазин PAR знаходиться приблизно за 100 метрів, а Lidl — за 8 хвилин пішки. Аптека розташована поруч із Lidl. До пляжу можна дійти приблизно за 2 хвилини доріжкою ліворуч від парковки.") },
  { id: "programs", label: tr("Programlehetőségek","Programs","Programme","Attività","Atrakcje","Розваги"), answer: tr("Programokhoz javaslom a Balaton-parti sétát, strandot, hajózást, kilátókat és a siófoki esti programokat. Mondja meg, hogy családdal vagy párban van, és nappali vagy esti programot keres.","For things to do, I suggest a lakeside walk, beach, boat trips, viewpoints, and evening programs in Siófok. Tell me if you're here with family or as a couple, and whether you want daytime or evening ideas.","Für Aktivitäten empfehle ich einen Spaziergang am Balaton, Strand, Schifffahrt, Aussichtspunkte und Abendprogramme in Siófok. Sagen Sie mir bitte, ob Sie mit Familie oder als Paar da sind und ob Sie tagsüber oder abends etwas suchen.","Per le attività consiglio una passeggiata sul lago, la spiaggia, gite in barca, punti panoramici e programmi serali a Siófok. Mi dica se è in famiglia o in coppia e se cerca idee per il giorno o per la sera.","Jeśli chodzi o atrakcje, polecam spacer nad Balatonem, plażę, rejsy statkiem, punkty widokowe i wieczorne wyjścia w Siófok. Powiedz, czy jesteś z rodziną czy w parze i czy szukasz czegoś na dzień czy na wieczór.","Щодо розваг, раджу прогулянку набережною Балатону, пляж, прогулянки на кораблику, оглядові точки та вечірні програми в Шіофоку. Скажіть, ви з родиною чи парою, і шукаєте ідеї на день чи на вечір.") },
  { id: "balaton", label: tr("Balaton","Lake Balaton","Balaton","Balaton","Balaton","Балатон"), answer: tr("A Balaton Magyarország legnagyobb tava. Siófokon népszerű a szabadstrand és a kikötő. Ha megmondja, melyik napszakban menne, ajánlok nyugodtabb vagy nyüzsgőbb partszakaszt.","Lake Balaton is Hungary's largest lake. In Siófok, the free beach and the harbour are popular. Tell me what time of day you plan to go, and I can suggest a calmer or busier area.","Der Balaton ist der größte See Ungarns. In Siófok sind der freie Strand und der Hafen besonders beliebt. Wenn Sie mir sagen, zu welcher Tageszeit Sie gehen möchten, empfehle ich einen ruhigeren oder belebteren Abschnitt.","Il Balaton è il lago più grande dell’Ungheria. A Siófok sono molto popolari la spiaggia libera e il porto. Se mi dice a che ora vorrebbe andarci, posso consigliare una zona più tranquilla o più vivace.","Balaton to największe jezioro na Węgrzech. W Siófok popularne są plaża bezpłatna i port. Jeśli powiesz, o jakiej porze chcesz tam iść, polecę spokojniejsze albo bardziej żywe miejsce.","Балатон — найбільше озеро Угорщини. У Шіофоку популярні безкоштовний пляж і порт. Якщо скажете, у який час дня хочете піти, я пораджу тихіше або більш жваве місце.") },
];

const flattenRouteItems = (routes: Record<string | number, RouteInfo>, prefix: string) =>
  Object.entries(routes).map(([key, value]) => ({
    id: `${prefix}-${key}`,
    label: value.label,
    answer: value.answer,
  }));

const phraseMatches = (q: string, phrases: string[]) => phrases.some((p) => q.includes(normalizeForMatch(p)));

async function askServerAI(question: string, language: LangCode): Promise<string | null> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, language }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const answer = typeof data?.answer === "string" ? data.answer.trim() : "";
    return answer || null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<LangCode>("hu-HU");
  const [answer, setAnswer] = useState("Kérdezzen bátran!");
  const [heardText, setHeardText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showReceptionHelp, setShowReceptionHelp] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [typedQuestion, setTypedQuestion] = useState("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recognitionTimeoutRef = useRef<number | null>(null);
  const speakTimeoutRef = useRef<number | null>(null);
  const isStartingRecognitionRef = useRef(false);
  const isStoppingRecognitionRef = useRef(false);
  const handledResultRef = useRef(false);
  const recognitionSessionRef = useRef(0);

  const ui = useMemo(() => ({
    welcome: tr("Kérdezzen bátran!","Please feel free to ask!","Fragen Sie gern!","Chieda pure!","Proszę pytać śmiało!","Будь ласка, запитуйте!"),
    subtitle: tr("Kata – virtuális recepciós","Kata – virtual receptionist","Kata – virtuelle Rezeptionistin","Kata – receptionist virtuale","Kata – wirtualna recepcjonistka","Ката – віртуальна адміністраторка"),
    chooseLang: tr("Válasszon nyelvet vagy kérdezzen bátran","Choose a language or ask freely","Wählen Sie eine Sprache oder fragen Sie einfach","Scelga una lingua oppure chieda pure","Wybierz język lub zadaj pytanie","Оберіть мову або просто запитайте"),
    rooms: tr("Silver Garden Szobák","Silver Garden Rooms","Silver Garden Zimmer","Silver Garden Camere","Silver Garden Pokoje","Silver Garden Кімнати"),
    apartments: tr("Silver Garden Apartmanok","Silver Garden Apartments","Silver Garden Apartments","Silver Garden Appartamenti","Silver Garden apartamenty","Silver Garden Апартаменти"),
    relax: tr("Silver Relax Szobák","Silver Relax Rooms","Silver Relax Zimmer","Silver Relax Stanze","Silver Relax Pokoje","Silver Relax Kімнати"),
    heard: tr("Felismert beszéd:","Recognized speech:","Erkannte Sprache:","Testo riconosciuto:","Rozpoznana mowa:","Розпізнане мовлення:"),
    reply: tr("Kata válasza:","Kata's answer:","Katas Antwort:","Risposta di Kata:","Odpowiedź Katy:","Відповідь Кати:"),
    askReception: tr("💬 WhatsApp recepció","💬 WhatsApp reception","💬 WhatsApp Rezeption","💬 Reception WhatsApp","💬 Recepcja WhatsApp","💬 WhatsApp рецепція"),
    contactButton: tr("Kapcsolat","Contact","Kontakt","Contatto","Kontakt","Контакт"),
    emergencyPhone: tr("🚨 Sürgősségi telefon","🚨 Emergency phone","🚨 Notruftelefon","🚨 Telefono di emergenza","🚨 Telefon alarmowy","🚨 Екстрений телефон"),
    listen: tr("🎤 Beszélek Katával","🎤 Talk to Kata","🎤 Talk to Kata","🎤 Parla con Kata","🎤 Rozmawiam z Katą","🎤 Говорю з Катою"),
    listening: tr("🎤 Hallgatom...","🎤 Listening...","🎤 Ich höre zu...","🎤 Ascolto...","🎤 Słucham...","🎤 Слухаю..."),
    speakNow: tr("Beszéljen most.","Speak now.","Sprechen Sie jetzt.","Parli adesso.","Proszę mówić teraz.","Говоріть зараз."),
    tapToStop: tr("Nyomja meg újra a leállításhoz","Press again to stop","Zum Stoppen erneut drücken","Premi di nuovo per fermare","Naciśnij ponownie, aby zatrzymać","Натисніть ще раз, щоб зупинити"),
    recognitionUnsupported: tr("A beszédfelismerés ebben a böngészőben nem támogatott. Nyissa meg Chrome-ban vagy írja be a kérdését.","Speech recognition is not supported in this browser. Please open it in Chrome or type your question.","Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte öffnen Sie Chrome oder tippen Sie Ihre Frage ein.","Il riconoscimento vocale non è supportato in questo browser. Aprilo in Chrome oppure scriva la domanda.","Rozpoznawanie mowy nie jest obsługiwane w tej przeglądarce. Otwórz w Chrome lub wpisz pytanie.","Розпізнавання мовлення не підтримується в цьому браузері. Відкрийте в Chrome або введіть питання."),
    micDenied: tr("A mikrofon nincs engedélyezve a böngészőben.","The microphone is not enabled in the browser.","Das Mikrofon ist im Browser nicht aktiviert.","Il microfono non è abilitato nel browser.","Mikrofon nie jest włączony w przeglądarce.","Мікрофон не дозволено в браузері."),
    micUnavailable: tr("A mikrofon nem érhető el ezen az eszközön vagy böngészőben.","The microphone is not available on this device or browser.","Das Mikrofon ist auf diesem Gerät oder in diesem Browser nicht verfügbar.","Il microfono non è disponibile su questo dispositivo o browser.","Mikrofon nie jest dostępny na tym urządzeniu lub w tej przeglądarce.","Мікрофон недоступний на цьому пристрої або в браузері."),
    speechUnsupported: tr("A hangos felolvasás nem támogatott ebben a böngészőben.","Speech synthesis is not supported in this browser.","Die Sprachausgabe wird in diesem Browser nicht unterstützt.","La sintesi vocale non è supportata in questo browser.","Synteza mowy nie jest obsługiwana w tej przeglądarce.","Синтез мовлення не підтримується в цьому браузері."),
    recognitionFailed: tr("Beszédfelismerési hiba történt.","A speech recognition error occurred.","Bei der Spracherkennung ist ein Fehler aufgetreten.","Si è verificato un errore nel riconoscimento vocale.","Wystąpił błąd rozpoznawania mowy.","Сталася помилка розпізнавання мовлення."),
    noSpeech: tr("Nem hallottam tisztán. Kérem, próbálja újra vagy írja be a kérdését.","I could not hear clearly. Please try again or type your question.","Ich konnte es nicht klar hören. Bitte versuchen Sie es erneut oder schreiben Sie Ihre Frage.","Non ho sentito chiaramente. Riprovi oppure scriva la domanda.","Nie usłyszałam wyraźnie. Proszę spróbować ponownie lub wpisać pytanie.","Я не почула чітко. Будь ласка, спробуйте ще раз або введіть питання."),
    fallback: tr("Ebben egy recepciós kolléga fog segíteni. Megnyitom a WhatsApp kapcsolatot.","A receptionist colleague will help with this. I am opening the WhatsApp contact.","Dabei hilft ein Rezeptionskollege. Ich öffne den WhatsApp-Kontakt.","La aiuterà un collega della reception. Apro il contatto WhatsApp.","W tej sprawie pomoże pracownik recepcji. Otwieram kontakt WhatsApp.","У цьому допоможе працівник рецепції. Я відкриваю контакт WhatsApp."),
    pressToTalk: tr("Nyomja meg a beszélgetéshez","Press to start talking","Zum Sprechen drücken","Premi per parlare","Naciśnij, aby rozmawiać","Натисніть, щоб говорити"),
    weatherUnavailable: tr("Most nem tudok időjárást lekérdezni. Kérem, próbálja később.","I can't fetch the weather right now. Please try again later.","Ich kann das Wetter im Moment nicht abrufen. Bitte versuchen Sie es später erneut.","Al momento non riesco a recuperare il meteo. Riprovi più tardi.","Nie mogę teraz pobrać pogody. Proszę spróbować później.","Зараз я не можу отримати погоду. Спробуйте пізніше."),
    timeNow: tr("A pontos idő:","The current time is:","Die aktuelle Uhrzeit ist:","L'ora esatta è:","Aktualna godzina to:","Точний час:"),
    typePlaceholder: tr("Ide írja a kérdését…","Type your question here…","Schreiben Sie hier Ihre Frage…","Scriva qui la sua domanda…","Wpisz tutaj swoje pytanie…","Введіть тут своє питання…"),
    send: tr("Küldés","Send","Senden","Invia","Wyślij","Надіслати"),
    typedHelp: tr("Ha a mikrofon nem működik, írja be a kérdését.","If the microphone does not work, type your question.","Wenn das Mikrofon nicht funktioniert, schreiben Sie Ihre Frage.","Se il microfono non funziona, scriva la domanda.","Jeśli mikrofon nie działa, wpisz pytanie.","Якщо мікрофон не працює, введіть своє питання."),
    receptionCardTitle: tr("Recepciós segítség","Reception help","Hilfe von der Rezeption","Aiuto reception","Pomoc recepcji","Допомога рецепції"),
    receptionCardText: tr("A rendszer nem talált biztos választ. A WhatsApp gombbal közvetlenül írhat a recepciós kollégának ezen a számon: +36 70 408 9437.","The system did not find a reliable answer. Use the WhatsApp button to message the receptionist directly at +36 70 408 9437.","Das System hat keine sichere Antwort gefunden. Mit der WhatsApp-Taste können Sie direkt dem Rezeptionskollegen unter +36 70 408 9437 schreiben.","Il sistema non ha trovato una risposta sicura. Con il pulsante WhatsApp può scrivere direttamente al collega della reception al numero +36 70 408 9437.","System nie znalazł pewnej odpowiedzi. Przyciskiem WhatsApp możesz napisać bezpośrednio do recepcji pod numer +36 70 408 9437.","Система не знайшла надійної відповіді. Кнопкою WhatsApp можна написати працівнику рецепції напряму на номер +36 70 408 9437."),
    contactTitle: tr("Kapcsolat","Contact","Kontakt","Contatto","Kontakt","Контакт"),
    contactSubtext: tr("Silver Garden","Silver Garden","Silver Garden","Silver Garden","Silver Garden","Silver Garden"),
  }), []);

  const languageLabels = useMemo(() => [
    { code: "hu-HU" as LangCode, label: "🇭🇺 Magyar" },
    { code: "en-US" as LangCode, label: "🇬🇧 English" },
    { code: "de-DE" as LangCode, label: "🇩🇪 Deutsch" },
    { code: "it-IT" as LangCode, label: "🇮🇹 Italiano" },
    { code: "pl-PL" as LangCode, label: "🇵🇱 Polski" },
    { code: "uk-UA" as LangCode, label: "🇺🇦 Українська" },
  ], []);

  const roomItems = useMemo(() => flattenRouteItems(roomRoutes, "room"), []);
  const apartmentItems = useMemo(() => flattenRouteItems(apartmentRoutes, "apartment"), []);
  const relaxItems = useMemo(() => flattenRouteItems(relaxRoutes, "relax"), []);

  useEffect(() => {
    setAnswer(getText(ui.welcome, selectedLanguage));
    setShowReceptionHelp(false);
  }, [selectedLanguage, ui.welcome]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) setVoices(allVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const t1 = window.setTimeout(loadVoices, 300);
    const t2 = window.setTimeout(loadVoices, 1000);
    const t3 = window.setTimeout(loadVoices, 2000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);

      if (speakTimeoutRef.current) window.clearTimeout(speakTimeoutRef.current);
      if (recognitionTimeoutRef.current) window.clearTimeout(recognitionTimeoutRef.current);

      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      } catch {}

      try {
        recognitionRef.current?.abort?.();
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  const normalizeForSpeech = (text: string) =>
    text.replace(/\s+/g, " ").replace(/A\s*([1-5])/g, "A $1").replace(/R\s*([1-4])/g, "R $1").replace(/R\s*P/g, "R P").trim();

  const pickBestVoice = (lang: LangCode) => {
    if (!voices.length) return null;
    const lowerLang = lang.toLowerCase();
    const base = lowerLang.split("-")[0];
    const exact = voices.find((v) => v.lang.toLowerCase() === lowerLang);
    if (exact) return exact;
    const baseMatch = voices.find((v) => v.lang.toLowerCase().startsWith(base));
    if (baseMatch) return baseMatch;
    return voices[0] || null;
  };

  const openReceptionWhatsApp = (question?: string) => {
    const baseMessage = tr("Szia, recepciós segítséget kérek.","Hello, I need help from reception.","Hallo, ich brauche Hilfe von der Rezeption.","Ciao, ho bisogno di aiuto dalla reception.","Cześć, potrzebuję pomocy recepcji.","Привіт, мені потрібна допомога рецепції.");
    const fullMessage = question ? `${getText(baseMessage, selectedLanguage)}\n\n${question}` : getText(baseMessage, selectedLanguage);
    window.open(`https://wa.me/${RECEPTION_WHATSAPP_PHONE}?text=${encodeURIComponent(fullMessage)}`, "_blank");
  };

  const clearRecognitionTimeout = () => {
    if (recognitionTimeoutRef.current) {
      window.clearTimeout(recognitionTimeoutRef.current);
      recognitionTimeoutRef.current = null;
    }
  };

  const hardResetRecognition = () => {
    clearRecognitionTimeout();
    recognitionSessionRef.current += 1;
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort?.();
        recognitionRef.current.stop();
      }
    } catch {}
    recognitionRef.current = null;
    isStartingRecognitionRef.current = false;
    isStoppingRecognitionRef.current = false;
    setIsListening(false);
  };

  const stopListeningInternal = () => {
    clearRecognitionTimeout();
    if (!recognitionRef.current) {
      setIsListening(false);
      return;
    }
    if (isStoppingRecognitionRef.current) return;
    isStoppingRecognitionRef.current = true;
    const currentSession = recognitionSessionRef.current;
    try {
      recognitionRef.current.stop();
      window.setTimeout(() => {
        if (recognitionSessionRef.current === currentSession && isListening) {
          try { recognitionRef.current?.abort?.(); } catch {}
        }
      }, 250);
    } catch {
      try { recognitionRef.current.abort?.(); } catch {}
    }
    window.setTimeout(() => {
      if (recognitionSessionRef.current === currentSession) hardResetRecognition();
    }, 900);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAnswer(getText(ui.speechUnsupported, selectedLanguage));
      return;
    }

    const cleanedText = normalizeForSpeech(text);
    const voice = pickBestVoice(selectedLanguage);
    const utterance = new SpeechSynthesisUtterance(cleanedText);

    utterance.lang = voice?.lang || selectedLanguage;
    utterance.voice = voice || null;
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    try { window.speechSynthesis.cancel(); } catch {}

    if (speakTimeoutRef.current) window.clearTimeout(speakTimeoutRef.current);

    speakTimeoutRef.current = window.setTimeout(() => {
      try { window.speechSynthesis.speak(utterance); } catch { setIsSpeaking(false); }
    }, 200);
  };

  const setAnswerAndSpeak = (text: string, options?: { receptionistHelp?: boolean; sourceQuestion?: string }) => {
    setAnswer(text);
    setShowReceptionHelp(Boolean(options?.receptionistHelp));
    speak(text);
    if (options?.receptionistHelp) {
      window.setTimeout(() => openReceptionWhatsApp(options.sourceQuestion), 250);
    }
  };

  const getCurrentTimeText = (lang: LangCode) => {
    const now = new Date();
    const formatted = new Intl.DateTimeFormat(lang, { hour: "2-digit", minute: "2-digit" }).format(now);
    return `${getText(ui.timeNow, lang)} ${formatted}.`;
  };

  const SIOFOK = { lat: 46.9077, lon: 18.0436 };

  const getWeatherText = async (lang: LangCode) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${SIOFOK.lat}&longitude=${SIOFOK.lon}&current=temperature_2m,apparent_temperature,wind_speed_10m&timezone=auto`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("weather fetch failed");
      const data = await res.json();
      const current = data?.current;
      const temp = typeof current?.temperature_2m === "number" ? Math.round(current.temperature_2m) : null;
      const feels = typeof current?.apparent_temperature === "number" ? Math.round(current.apparent_temperature) : null;
      const wind = typeof current?.wind_speed_10m === "number" ? Math.round(current.wind_speed_10m) : null;
      const text = tr(
        `Siófokon jelenleg${temp !== null ? ` ${temp} fok van` : ""}${feels !== null ? `, hőérzet ${feels} fok` : ""}${wind !== null ? `, a szél ${wind} kilométer per óra` : ""}.`,
        `In Siófok right now${temp !== null ? ` it is ${temp} degrees` : ""}${feels !== null ? `, feels like ${feels} degrees` : ""}${wind !== null ? `, wind ${wind} kilometers per hour` : ""}.`,
        `In Siófok ist es aktuell${temp !== null ? ` ${temp} Grad` : ""}${feels !== null ? `, gefühlt ${feels} Grad` : ""}${wind !== null ? `, Wind ${wind} Kilometer pro Stunde` : ""}.`,
        `A Siófok adesso${temp !== null ? ` ci sono ${temp} gradi` : ""}${feels !== null ? `, percepiti ${feels} gradi` : ""}${wind !== null ? `, vento ${wind} chilometri orari` : ""}.`,
        `W Siófok teraz${temp !== null ? ` jest ${temp} stopni` : ""}${feels !== null ? `, odczuwalne ${feels} stopni` : ""}${wind !== null ? `, wiatr ${wind} kilometrów na godzinę` : ""}.`,
        `У Шіофоку зараз${temp !== null ? ` ${temp} градусів` : ""}${feels !== null ? `, відчувається як ${feels} градусів` : ""}${wind !== null ? `, вітер ${wind} кілометрів за годину` : ""}.`
      );
      return getText(text, lang);
    } catch {
      return getText(ui.weatherUnavailable, lang);
    }
  };

  const detectRoomNumber = (normalizedText: string): number | null => {
    const match = normalizedText.match(/\b([1-8])\b/);
    if (!match) return null;
    const num = Number(match[1]);
    return num >= 1 && num <= 8 ? num : null;
  };

  const detectApartmentNumber = (normalizedText: string): number | null => {
    const match = normalizedText.match(/\b([1-5])\b/);
    if (!match) return null;
    const num = Number(match[1]);
    return num >= 1 && num <= 5 ? num : null;
  };

  const detectRelaxCode = (normalizedText: string): string | null => {
    if (containsAny(normalizedText, ["premium", "prémium", "relax premium", "premium relax", "rp", "r p"].map(normalizeForMatch))) return "premium";
    const match = normalizedText.match(/\b([1-4])\b/);
    if (!match) return null;
    return match[1];
  };

  const getDynamicRouteResponse = (input: string): string | null => {
    const normalized = mapNumberWordsToDigits(input);
    const isRoomQuery = containsAny(normalized, ["szoba","room","zimmer","camera","pokoj","кімната","hol van","merre van","where is","find room","wo ist","dove","gdzie","де"].map(normalizeForMatch));
    const isApartmentQuery = containsAny(normalized, ["apartman","apartment","appartamento","apartament","апартамент","a 1","a 2","a 3","a 4","a 5"].map(normalizeForMatch));
    const isRelaxQuery = containsAny(normalized, ["relax","r 1","r 2","r 3","r 4","r p","premium","prémium"].map(normalizeForMatch));
    if (isApartmentQuery) {
      const num = detectApartmentNumber(normalized);
      if (num && apartmentRoutes[num]) return getText(apartmentRoutes[num].answer, selectedLanguage);
    }
    if (isRelaxQuery) {
      const code = detectRelaxCode(normalized);
      if (code && relaxRoutes[code]) return getText(relaxRoutes[code].answer, selectedLanguage);
    }
    if (isRoomQuery) {
      const num = detectRoomNumber(normalized);
      if (num && roomRoutes[num]) return getText(roomRoutes[num].answer, selectedLanguage);
    }
    return null;
  };

  const getSmartLocalResponse = (input: string): string | null => {
    const q = normalizeForMatch(input);

    if (phraseMatches(q, ["étterem","etterem","restaurant","ristorante","restauracja","restaurant near","where to eat","enni","eat nearby"])) {
      return getText(tr("Ajánlott éttermek a közelben: Valhalla Bistro, Kiskert Étterem és Silver Étterem.","Recommended nearby restaurants: Valhalla Bistro, Kiskert Restaurant and Silver Restaurant.","Empfohlene Restaurants in der Nähe: Valhalla Bistro, Kiskert Restaurant und Silver Restaurant.","Ristoranti consigliati nelle vicinanze: Valhalla Bistro, Kiskert Restaurant e Silver Restaurant.","Polecane restauracje w pobliżu: Valhalla Bistro, Kiskert Restaurant i Silver Restaurant.","Рекомендовані ресторани поруч: Valhalla Bistro, Kiskert Restaurant і Silver Restaurant."), selectedLanguage);
    }

    if (phraseMatches(q, ["bevasarlas","bolt","shop","shopping","store","lidl","par","market","supermarket"])) {
      return getText(tr("Bevásárlás: a PAR üzlet körülbelül 100 méterre van, a Lidl pedig körülbelül 8 perc sétára található.","Shopping: PAR store is about 100 meters away, and Lidl is about 8 minutes away on foot.","Einkaufen: Das PAR-Geschäft ist etwa 100 Meter entfernt, Lidl ist etwa 8 Minuten zu Fuß entfernt.","Spesa: il negozio PAR è a circa 100 metri, mentre Lidl è a circa 8 minuti a piedi.","Zakupy: sklep PAR znajduje się około 100 metrów stąd, a Lidl około 8 minut spacerem.","Покупки: магазин PAR розташований приблизно за 100 метрів, а Lidl — приблизно за 8 хвилин пішки."), selectedLanguage);
    }

    if (phraseMatches(q, ["gyogyszertar","apatheke","apotheke","pharmacy","farmacia","apteka"])) {
      return getText(tr("A gyógyszertár a Lidl mellett található.","The pharmacy is next to Lidl.","Die Apotheke befindet sich neben Lidl.","La farmacia si trova accanto al Lidl.","Apteka znajduje się obok Lidla.","Аптека розташована поруч із Lidl."), selectedLanguage);
    }

    if (phraseMatches(q, ["strand","beach","spiaggia","plaża","plage","shore","balaton beach","part"])) {
      return getText(tr("A strandot a parkoló bal oldalánál induló levezető úton körülbelül 2 perc alatt éri el.","The beach can be reached in about 2 minutes via the path that starts on the left side of the parking area.","Den Strand erreichen Sie in etwa 2 Minuten über den Weg links vom Parkplatz.","La spiaggia è raggiungibile in circa 2 minuti tramite il sentiero che inizia sul lato sinistro del parcheggio.","Na plażę dojdziesz w około 2 minuty ścieżką zaczynającą się po lewej stronie parkingu.","До пляжу можна дійти приблизно за 2 хвилини доріжкою, що починається ліворуч від парковки."), selectedLanguage);
    }

    if (phraseMatches(q, ["kapcsolat","contact","kontakt","contatto","email","telefon","phone","whatsapp"])) {
      return getText(tr(`Kapcsolat: Silver Garden, e-mail: ${CONTACT_EMAIL}, telefon: ${CONTACT_PHONE_DISPLAY}.`,`Contact: Silver Garden, email: ${CONTACT_EMAIL}, phone: ${CONTACT_PHONE_DISPLAY}.`,`Kontakt: Silver Garden, E-Mail: ${CONTACT_EMAIL}, Telefon: ${CONTACT_PHONE_DISPLAY}.`,`Contatto: Silver Garden, e-mail: ${CONTACT_EMAIL}, telefono: ${CONTACT_PHONE_DISPLAY}.`,`Kontakt: Silver Garden, e-mail: ${CONTACT_EMAIL}, telefon: ${CONTACT_PHONE_DISPLAY}.`,`Контакт: Silver Garden, e-mail: ${CONTACT_EMAIL}, телефон: ${CONTACT_PHONE_DISPLAY}.`), selectedLanguage);
    }

    return null;
  };

  const getFaqResponse = (input: string): string | null => {
    const q = normalizeForMatch(input);
    const groups: Array<{ patterns: string[]; answer: LocalizedText }> = [
      { patterns: ["reggeli", "breakfast", "fruhstuck", "colazione", "sniadanie", "сніданок"], answer: faqItems[0].answer },
      { patterns: ["wifi", "wi fi", "internet", "wlan", "net"], answer: faqItems[1].answer },
      { patterns: ["parkol", "parkolas", "parking", "parken", "parcheggio", "паркування"], answer: faqItems[2].answer },
      { patterns: ["wellness", "wellnesz", "spa", "szauna", "sauna"], answer: faqItems[3].answer },
      { patterns: ["medence", "pool", "piscina", "basen", "басейн"], answer: faqItems[4].answer },
      { patterns: ["kijelentkezes", "checkout", "check out", "check-out", "wymeldowanie", "виїзд"], answer: faqItems[5].answer },
      { patterns: ["bejelentkezes", "checkin", "check in", "check-in", "zameldowanie", "заселення"], answer: faqItems[6].answer },
      { patterns: ["kapu", "gate", "tor", "cancello", "brama", "ворота"], answer: faqItems[7].answer },
      { patterns: ["hazirend", "hazi rend", "house rules", "hausordnung", "regole della casa", "zasady domu", "правила"], answer: faqItems[8].answer },
      { patterns: ["kisallat", "allat", "kutya", "macska", "pet", "haustier", "animale", "zwierze", "домашня тварина"], answer: faqItems[9].answer },
      { patterns: ["szia", "hello", "hi", "jo napot", "jo reggelt", "jo estet", "hallo", "ciao", "dzień dobry", "czesc", "привіт"], answer: extraVoiceItems[0].answer },
      { patterns: ["kornyek", "kozelben", "nearby", "around here", "umgebung", "vicinanze", "okolicy", "поруч"], answer: extraVoiceItems[1].answer },
      { patterns: ["program", "programok", "what to do", "things to do", "aktivitaten", "attivita", "atrakcje", "розваги"], answer: extraVoiceItems[2].answer },
      { patterns: ["balaton", "lake balaton", "plattensee", "lago balaton", "jezioro balaton"], answer: extraVoiceItems[3].answer },
    ];
    for (const group of groups) {
      if (group.patterns.some((p) => q.includes(normalizeForMatch(p)))) return getText(group.answer, selectedLanguage);
    }
    return null;
  };

  const getResponse = async (input: string): Promise<{ text: string; receptionistHelp: boolean }> => {
    const q = normalizeForMatch(input);

    const timeTriggers = ["mennyi az ido","pontos ido","what time is it","time now","uhrzeit","wie spat","che ore sono","ktora godzina","котра година","точний час"].map(normalizeForMatch);
    if (timeTriggers.some((t) => q.includes(t))) return { text: getCurrentTimeText(selectedLanguage), receptionistHelp: false };

    const weatherTriggers = ["idojaras","milyen az ido","weather","forecast","wetter","meteo","pogoda","погода"].map(normalizeForMatch);
    if (weatherTriggers.some((t) => q.includes(t))) return { text: await getWeatherText(selectedLanguage), receptionistHelp: false };

    const dynamicRouteResponse = getDynamicRouteResponse(input);
    if (dynamicRouteResponse) return { text: dynamicRouteResponse, receptionistHelp: false };

    const smartLocalResponse = getSmartLocalResponse(input);
    if (smartLocalResponse) return { text: smartLocalResponse, receptionistHelp: false };

    const faqResponse = getFaqResponse(input);
    if (faqResponse) return { text: faqResponse, receptionistHelp: false };

    const aiAnswer = await askServerAI(input, selectedLanguage);
    if (aiAnswer) return { text: aiAnswer, receptionistHelp: false };

    return { text: getText(ui.fallback, selectedLanguage), receptionistHelp: true };
  };

  const askQuestion = async (question: string) => {
    const cleaned = question.trim();
    if (!cleaned) return;
    setHeardText(cleaned);
    const response = await getResponse(cleaned);
    setAnswerAndSpeak(response.text, {
      receptionistHelp: response.receptionistHelp,
      sourceQuestion: cleaned,
    });
  };

  const getRecognitionLang = () => selectedLanguage === "hu-HU" ? "hu-HU" : selectedLanguage;

  const startListening = async () => {
    if (typeof window === "undefined") return;

    if (isListening) {
      stopListeningInternal();
      return;
    }

    if (isStartingRecognitionRef.current) return;
    isStartingRecognitionRef.current = true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAnswer(getText(ui.recognitionUnsupported, selectedLanguage));
      isStartingRecognitionRef.current = false;
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setAnswer(getText(ui.micUnavailable, selectedLanguage));
      isStartingRecognitionRef.current = false;
      return;
    }

    try { window.speechSynthesis?.cancel(); } catch {}

    hardResetRecognition();
    handledResultRef.current = false;
    recognitionSessionRef.current += 1;
    const sessionId = recognitionSessionRef.current;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setAnswer(getText(ui.micDenied, selectedLanguage));
      isStartingRecognitionRef.current = false;
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = getRecognitionLang();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      if (recognitionSessionRef.current !== sessionId) return;
      setIsListening(true);
      setHeardText(getText(ui.listening, selectedLanguage));
      setAnswer(getText(ui.speakNow, selectedLanguage));
      isStartingRecognitionRef.current = false;

      recognitionTimeoutRef.current = window.setTimeout(() => {
        if (recognitionSessionRef.current !== sessionId) return;
        if (!handledResultRef.current) {
          stopListeningInternal();
          setHeardText("");
          setAnswer(getText(ui.noSpeech, selectedLanguage));
        }
      }, 7000);
    };

    recognition.onresult = async (event: SpeechRecognitionEventLike) => {
      if (recognitionSessionRef.current !== sessionId) return;
      handledResultRef.current = true;
      clearRecognitionTimeout();

      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!transcript) {
        setHeardText("");
        setAnswer(getText(ui.noSpeech, selectedLanguage));
        stopListeningInternal();
        return;
      }

      setHeardText(transcript);
      const response = await getResponse(transcript);
      setAnswerAndSpeak(response.text, {
        receptionistHelp: response.receptionistHelp,
        sourceQuestion: transcript,
      });
      stopListeningInternal();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (recognitionSessionRef.current !== sessionId) return;
      clearRecognitionTimeout();
      setIsListening(false);
      isStartingRecognitionRef.current = false;

      if (event.error === "no-speech") {
        setHeardText("");
        setAnswer(getText(ui.noSpeech, selectedLanguage));
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setHeardText("");
        setAnswer(getText(ui.micDenied, selectedLanguage));
        return;
      }
      if (event.error === "audio-capture") {
        setHeardText("");
        setAnswer(getText(ui.micUnavailable, selectedLanguage));
        return;
      }
      setHeardText("");
      setAnswer(getText(ui.recognitionFailed, selectedLanguage));
    };

    recognition.onend = () => {
      if (recognitionSessionRef.current !== sessionId) return;
      clearRecognitionTimeout();
      setIsListening(false);
      isStartingRecognitionRef.current = false;
      isStoppingRecognitionRef.current = false;
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      isStartingRecognitionRef.current = false;
      setAnswer(getText(ui.recognitionFailed, selectedLanguage));
      hardResetRecognition();
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setTypedQuestion("");
    setHeardText("");
    setShowReceptionHelp(false);
    setAnswerAndSpeak(getText(item.answer, selectedLanguage));
  };

  const handleTypedSubmit = async () => {
    if (!typedQuestion.trim()) return;
    const q = typedQuestion.trim();
    setTypedQuestion("");
    await askQuestion(q);
  };

  const sectionWrapperStyle = (background: string): CSSProperties => ({
    maxWidth: "1100px",
    width: "100%",
    marginBottom: "20px",
    background,
    border: "1px solid rgba(120, 98, 74, 0.12)",
    borderRadius: "18px",
    padding: "22px 18px",
    boxShadow: "0 4px 14px rgba(80, 60, 40, 0.05)",
  });

  const menuButtonStyle: CSSProperties = {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #d8cfc2",
    background: "#fffdf9",
    cursor: "pointer",
    fontSize: "15px",
    color: "#4b4034",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    transition: "all 0.2s ease",
  };

  const actionButtonStyle: CSSProperties = {
    padding: "20px",
    fontSize: "18px",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.10)",
    fontWeight: 700,
  };

  const renderMenuButtons = (items: MenuItem[]) =>
    items.map((item) => (
      <button key={item.id} onClick={() => handleItemClick(item)} style={menuButtonStyle}>
        {getText(item.label, selectedLanguage)}
      </button>
    ));

  const avatarIsActive = isListening || isSpeaking;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(180deg, #f7f3eb 0%, #efe8dc 100%)",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <style>{`
        @keyframes kataPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.045); }
          100% { transform: scale(1); }
        }
        @keyframes kataFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes kataRingGlow {
          0% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
          100% { opacity: 0.45; transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          maxWidth: "1100px",
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "260px",
            height: "260px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "8px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.15) 35%, rgba(173,140,96,0.18) 70%, rgba(173,140,96,0.28) 100%)",
              filter: "blur(2px)",
              opacity: avatarIsActive ? 1 : 0,
              animation: avatarIsActive ? "kataRingGlow 1.4s ease-in-out infinite" : "none",
              transition: "opacity 0.3s ease",
            }}
          />

          <img
            src="/kata.png"
            alt="Kata avatar"
            style={{
              position: "relative",
              width: "220px",
              height: "220px",
              objectFit: "cover",
              borderRadius: "50%",
              border: avatarIsActive ? "4px solid #d8bea0" : "4px solid #fffaf2",
              boxShadow: avatarIsActive
                ? "0 12px 30px rgba(140, 108, 72, 0.28)"
                : "0 6px 18px rgba(90,70,45,0.16)",
              animation: avatarIsActive ? "kataPulse 1.05s ease-in-out infinite" : "kataFloat 3.5s ease-in-out infinite",
              transition: "border 0.25s ease, box-shadow 0.25s ease",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: "-18px",
              bottom: "96px",
              background: "rgba(255, 253, 249, 0.97)",
              color: "#4b4034",
              padding: "9px 12px",
              borderRadius: "14px",
              fontSize: "14px",
              fontWeight: 700,
              border: "1px solid #e7dccd",
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              maxWidth: "170px",
              lineHeight: 1.25,
              zIndex: 6,
              textAlign: "center",
            }}
          >
            {isListening ? getText(ui.tapToStop, selectedLanguage) : getText(ui.pressToTalk, selectedLanguage)}
          </div>

          <button
            onClick={startListening}
            title={isListening ? getText(ui.listening, selectedLanguage) : getText(ui.listen, selectedLanguage)}
            aria-label={isListening ? getText(ui.listening, selectedLanguage) : getText(ui.listen, selectedLanguage)}
            style={{
              position: "absolute",
              right: "8px",
              bottom: "18px",
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              border: isListening ? "3px solid #ffd7d2" : "3px solid #f4eadb",
              background: isListening
                ? "linear-gradient(180deg, #b94233 0%, #8f2d22 100%)"
                : "linear-gradient(180deg, #7fa06b 0%, #5f7d4e 100%)",
              color: "#ffffff",
              fontSize: "28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isListening ? "0 10px 24px rgba(166, 61, 47, 0.35)" : "0 10px 24px rgba(95, 125, 78, 0.28)",
              animation: isListening ? "kataPulse 1s ease-in-out infinite" : "none",
              zIndex: 7,
            }}
          >
            🎤
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "300px",
            maxWidth: "760px",
            textAlign: "left",
          }}
        >
          <h1 style={{ fontSize: "40px", marginBottom: "10px", color: "#4b3f31" }}>Silver Garden Siófok</h1>
          <h2 style={{ marginBottom: "16px", color: "#6a5a48" }}>{getText(ui.subtitle, selectedLanguage)}</h2>

          <p style={{ marginBottom: "16px", fontSize: "18px", color: "#5a4e40" }}>
            {getText(ui.chooseLang, selectedLanguage)}
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "16px",
              flexWrap: "wrap",
            }}
          >
            {languageLabels.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: selectedLanguage === lang.code ? "2px solid #9f8c72" : "1px solid #d9cbb6",
                  background: selectedLanguage === lang.code ? "#e9decd" : "#f7f1e7",
                  color: "#4e4438",
                  cursor: "pointer",
                  boxShadow: selectedLanguage === lang.code ? "0 4px 10px rgba(120,95,65,0.10)" : "0 2px 6px rgba(0,0,0,0.04)",
                  fontWeight: selectedLanguage === lang.code ? 700 : 500,
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                ...actionButtonStyle,
                background: "linear-gradient(180deg, #8a7964 0%, #6d5f4f 100%)",
                padding: "14px 18px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getText(ui.contactButton, selectedLanguage)}
            </a>

            <button
              onClick={() => openReceptionWhatsApp(`Nyelv / Language: ${selectedLanguage}`)}
              style={{ ...actionButtonStyle, background: "#25D366", padding: "14px 18px" }}
            >
              {getText(ui.askReception, selectedLanguage)}
            </button>
          </div>
        </div>
      </div>

      <div style={{ ...sectionWrapperStyle("#fffaf3"), maxWidth: "700px" }}>
        <div style={{ marginBottom: "10px", color: "#5a4e40", fontWeight: 700 }}>
          {getText(ui.typedHelp, selectedLanguage)}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            value={typedQuestion}
            onChange={(e) => setTypedQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleTypedSubmit();
              }
            }}
            placeholder={getText(ui.typePlaceholder, selectedLanguage)}
            style={{
              flex: 1,
              minWidth: "240px",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid #d8cfc2",
              fontSize: "16px",
              outline: "none",
              background: "#fffdf9",
              color: "#4b4034",
            }}
          />
          <button
            onClick={() => void handleTypedSubmit()}
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              border: "none",
              background: "#6b7f59",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            {getText(ui.send, selectedLanguage)}
          </button>
        </div>
      </div>

      {showReceptionHelp && (
        <div
          style={{
            ...sectionWrapperStyle("#fff3f0"),
            maxWidth: "700px",
            border: "1px solid #f0c3b8",
          }}
        >
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#7b3d2a", marginBottom: "10px" }}>
            {getText(ui.receptionCardTitle, selectedLanguage)}
          </div>
          <div style={{ color: "#6a4b3c", marginBottom: "14px", lineHeight: 1.5 }}>
            {getText(ui.receptionCardText, selectedLanguage)}
          </div>
          <button
            onClick={() => openReceptionWhatsApp(heardText || answer)}
            style={{ ...actionButtonStyle, background: "#25D366", padding: "16px 20px" }}
          >
            {getText(ui.askReception, selectedLanguage)}
          </button>
        </div>
      )}

      <div style={sectionWrapperStyle("#fcf8f2")}>
        <div style={{ marginBottom: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "26px" }}>🛏️</div>
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#4b3f31" }}>
            {getText(ui.rooms, selectedLanguage)}
          </h3>
          <div style={{ width: "40px", height: "3px", background: "#c9b79c", borderRadius: "2px" }} />
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {renderMenuButtons(roomItems)}
        </div>
      </div>

      <div style={sectionWrapperStyle("#f8f2e9")}>
        <div style={{ marginBottom: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "26px" }}>🏡</div>
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#4b3f31" }}>
            {getText(ui.apartments, selectedLanguage)}
          </h3>
          <div style={{ width: "40px", height: "3px", background: "#c9b79c", borderRadius: "2px" }} />
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {renderMenuButtons(apartmentItems)}
        </div>
      </div>

      <div style={sectionWrapperStyle("#fdf9f4")}>
        <div style={{ marginBottom: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "26px" }}>🧖‍♂️</div>
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#4b3f31" }}>
            {getText(ui.relax, selectedLanguage)}
          </h3>
          <div style={{ width: "40px", height: "3px", background: "#c9b79c", borderRadius: "2px" }} />
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {renderMenuButtons(relaxItems)}
        </div>
      </div>

      <div style={sectionWrapperStyle("#f6efe5")}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {faqItems.map((item) => (
            <button key={item.id} onClick={() => handleItemClick(item)} style={menuButtonStyle}>
              {getText(item.label, selectedLanguage)}
            </button>
          ))}
        </div>
      </div>

      <div style={sectionWrapperStyle("#fffaf3")}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {extraVoiceItems.map((item) => (
            <button key={item.id} onClick={() => handleItemClick(item)} style={menuButtonStyle}>
              {getText(item.label, selectedLanguage)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" }}>
        <button
          onClick={() => openReceptionWhatsApp(`Nyelv / Language: ${selectedLanguage}`)}
          style={{ ...actionButtonStyle, background: "#25D366" }}
        >
          {getText(ui.askReception, selectedLanguage)}
        </button>

        <button
          onClick={() => {
            setShowEmergency(true);
            window.location.href = "tel:+36704089437";
          }}
          style={{
            ...actionButtonStyle,
            background: "linear-gradient(180deg, #e53935 0%, #b71c1c 100%)",
            boxShadow: "0 6px 16px rgba(183,28,28,0.35)",
          }}
        >
          {getText(ui.emergencyPhone, selectedLanguage)}
        </button>
      </div>

      {showEmergency && (
        <a
          href="tel:+36704089437"
          style={{
            display: "inline-block",
            marginBottom: "20px",
            background: "#fff3f3",
            padding: "16px 20px",
            borderRadius: "14px",
            border: "1px solid #f5c2c2",
            color: "#7a1c1c",
            fontSize: "20px",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            textDecoration: "none",
          }}
        >
          📞 {CONTACT_PHONE_DISPLAY}
        </a>
      )}

      <div
        style={{
          marginTop: "10px",
          background: "#fffaf3",
          padding: "16px",
          borderRadius: "14px",
          maxWidth: "700px",
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          fontSize: "18px",
          border: "1px solid #e7dccd",
          color: "#4f4438",
        }}
      >
        <strong>{getText(ui.heard, selectedLanguage)}</strong>
        <div style={{ marginTop: "8px", color: "#6b5b49" }}>{heardText || "—"}</div>
      </div>

      <div
        style={{
          marginTop: "20px",
          background: "#fffdf9",
          padding: "20px",
          borderRadius: "14px",
          maxWidth: "700px",
          width: "100%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          fontSize: "20px",
          border: "1px solid #e7dccd",
          color: "#4b4034",
        }}
      >
        <strong>{getText(ui.reply, selectedLanguage)}</strong>
        <div style={{ marginTop: "10px" }}>{answer}</div>
      </div>

      <div
        style={{
          marginTop: "20px",
          background: "#f9f6ef",
          padding: "18px",
          borderRadius: "14px",
          maxWidth: "700px",
          width: "100%",
          border: "1px solid #e7dccd",
          color: "#4b4034",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "10px", fontSize: "22px" }}>
          {getText(ui.contactTitle, selectedLanguage)}
        </div>
        <div style={{ marginBottom: "8px" }}>{getText(ui.contactSubtext, selectedLanguage)}</div>
        <div style={{ marginBottom: "6px" }}>📧 {CONTACT_EMAIL}</div>
        <div style={{ marginBottom: "12px" }}>📞 {CONTACT_PHONE_DISPLAY}</div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{
              display: "inline-block",
              background: "#6d5f4f",
              color: "white",
              padding: "12px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            📧 Email
          </a>

          <a
            href={`tel:+${RECEPTION_WHATSAPP_PHONE}`}
            style={{
              display: "inline-block",
              background: "#4f6f52",
              color: "white",
              padding: "12px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            📞 Hívás
          </a>

          <a
            href={`https://wa.me/${RECEPTION_WHATSAPP_PHONE}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              background: "#25D366",
              color: "white",
              padding: "12px 16px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
