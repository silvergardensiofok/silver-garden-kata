"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type LangCode = "hu-HU" | "en-US" | "de-DE" | "it-IT" | "pl-PL" | "uk-UA";
type LocalizedText = Record<LangCode, string>;

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type MenuItem = {
  id: string;
  label: LocalizedText;
  answer: LocalizedText;
  keywords: string[];
};

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

const getText = (text: LocalizedText, lang: LangCode) =>
  text[lang] || text["hu-HU"];

export default function Home() {
  const [answer, setAnswer] = useState("Kérdezzen bátran!");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [heardText, setHeardText] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<LangCode>("hu-HU");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showEmergency, setShowEmergency] = useState(false);
  const speakTimeoutRef = useRef<number | null>(null);

  const ui = useMemo(
    () => ({
      welcome: tr(
        "Kérdezzen bátran!",
        "Please feel free to ask!",
        "Fragen Sie gern!",
        "Chieda pure!",
        "Proszę pytać śmiało!",
        "Будь ласка, запитуйте!"
      ),
      subtitle: tr(
        "Kata – virtuális recepciós",
        "Kata – virtual receptionist",
        "Kata – virtuelle Rezeptionistin",
        "Kata – receptionist virtuale",
        "Kata – wirtualna recepcjonistka",
        "Ката – віртуальна адміністраторка"
      ),
      chooseLang: tr(
        "Válasszon nyelvet vagy kérdezzen bátran",
        "Choose a language or ask freely",
        "Wählen Sie eine Sprache oder fragen Sie einfach",
        "Scelga una lingua oppure chieda pure",
        "Wybierz język lub zadaj pytanie",
        "Оберіть мову або просто запитайте"
      ),
      rooms: tr(
        "Silver Garden Szobák",
        "Rooms",
        "Zimmer",
        "Camere",
        "Pokoje",
        "Кімнати"
      ),
      apartments: tr(
        "Apartmanok",
        "Apartments",
        "Apartments",
        "Appartamenti",
        "Apartamenty",
        "Апартаменти"
      ),
      relax: tr("Relax", "Relax", "Relax", "Relax", "Relax", "Релакс"),
      heard: tr(
        "Felismert beszéd:",
        "Recognized speech:",
        "Erkannte Sprache:",
        "Testo riconosciuto:",
        "Rozpoznana mowa:",
        "Розпізнане мовлення:"
      ),
      reply: tr(
        "Kata válasza:",
        "Kata's answer:",
        "Katas Antwort:",
        "Risposta di Kata:",
        "Odpowiedź Katy:",
        "Відповідь Кати:"
      ),
      askReception: tr(
        "👩‍💼 Recepcióst kérek",
        "👩‍💼 I need a receptionist",
        "👩‍💼 Ich brauche die Rezeption",
        "👩‍💼 Vorrei la reception",
        "👩‍💼 Potrzebuję recepcji",
        "👩‍💼 Мені потрібна рецепція"
      ),
      emergencyPhone: tr(
        "🚨 Sürgősségi telefon",
        "🚨 Emergency phone",
        "🚨 Notruftelefon",
        "🚨 Telefono di emergenza",
        "🚨 Telefon alarmowy",
        "🚨 Екстрений телефон"
      ),
      soundTest: tr(
        "🔊 Hang teszt",
        "🔊 Sound test",
        "🔊 Soundtest",
        "🔊 Test audio",
        "🔊 Test dźwięku",
        "🔊 Перевірка звуку"
      ),
      listen: tr(
        "🎤 Beszélek Katával",
        "🎤 Talk to Kata",
        "🎤 Mit Kata sprechen",
        "🎤 Parla con Kata",
        "🎤 Rozmawiam z Katą",
        "🎤 Говорю з Катою"
      ),
      listening: tr(
        "🎤 Hallgatom...",
        "🎤 Listening...",
        "🎤 Ich höre zu...",
        "🎤 Ascolto...",
        "🎤 Słucham...",
        "🎤 Слухаю..."
      ),
      speakNow: tr(
        "Beszéljen most.",
        "Speak now.",
        "Sprechen Sie jetzt.",
        "Parli adesso.",
        "Proszę mówić teraz.",
        "Говоріть зараз."
      ),
      recognitionUnsupported: tr(
        "A beszédfelismerés ebben a böngészőben nem támogatott. Nyissa meg Chrome-ban.",
        "Speech recognition is not supported in this browser. Please open it in Chrome.",
        "Die Spracherkennung wird in diesem Browser nicht unterstützt. Bitte öffnen Sie Chrome.",
        "Il riconoscimento vocale non è supportato in questo browser. Aprilo in Chrome.",
        "Rozpoznawanie mowy nie jest obsługiwane w tej przeglądarce. Otwórz ją w Chrome.",
        "Розпізнавання мовлення не підтримується в цьому браузері. Відкрийте його в Chrome."
      ),
      micDenied: tr(
        "A mikrofon nincs engedélyezve a böngészőben.",
        "The microphone is not enabled in the browser.",
        "Das Mikrofon ist im Browser nicht aktiviert.",
        "Il microfono non è abilitato nel browser.",
        "Mikrofon nie jest włączony w przeglądarce.",
        "Мікрофон не дозволено в браузері."
      ),
      speechUnsupported: tr(
        "A hangos felolvasás nem támogatott ebben a böngészőben.",
        "Speech synthesis is not supported in this browser.",
        "Die Sprachausgabe wird in diesem Browser nicht unterstützt.",
        "La sintesi vocale non è supportata in questo browser.",
        "Synteza mowy nie jest obsługiwana w tej przeglądarce.",
        "Синтез мовлення не підтримується в цьому браузері."
      ),
      fallback: tr(
        "Ebben egy kollégám fog segíteni. Kérem, egy pillanat türelmet.",
        "A colleague will help you with this. Please wait a moment.",
        "Ein Kollege wird Ihnen dabei helfen. Bitte einen Moment Geduld.",
        "Un collega la aiuterà. Attenda un momento, per favore.",
        "W tej sprawie pomoże Panu kolega. Proszę o chwilę cierpliwości.",
        "У цьому вам допоможе мій колега. Будь ласка, зачекайте хвилинку."
      ),
      hello: tr(
        "Szia, én Kata vagyok.",
        "Hello, I am Kata.",
        "Hallo, ich bin Kata.",
        "Ciao, sono Kata.",
        "Cześć, jestem Kata.",
        "Привіт, я Ката."
      ),
      pressToTalk: tr(
        "Nyomja meg a beszélgetéshez",
        "Press to start talking",
        "Zum Sprechen drücken",
        "Premi per parlare",
        "Naciśnij, aby rozmawiać",
        "Натисніть, щоб говорити"
      ),
    }),
    []
  );

  const languageLabels = useMemo(
    () => [
      { code: "hu-HU" as LangCode, label: "🇭🇺 Magyar" },
      { code: "en-US" as LangCode, label: "🇬🇧 English" },
      { code: "de-DE" as LangCode, label: "🇩🇪 Deutsch" },
      { code: "it-IT" as LangCode, label: "🇮🇹 Italiano" },
      { code: "pl-PL" as LangCode, label: "🇵🇱 Polski" },
      { code: "uk-UA" as LangCode, label: "🇺🇦 Українська" },
    ],
    []
  );

  const roomItems: MenuItem[] = useMemo(
    () => [
      {
        id: "szoba1",
        label: tr(
          "Szoba 1",
          "Room 1",
          "Zimmer 1",
          "Camera 1",
          "Pokój 1",
          "Кімната 1"
        ),
        answer: tr(
          "Az 1-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Balra az első szoba az 1-es szoba.",
          "To find room 1, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The first room on the left is room 1.",
          "Um Zimmer 1 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das erste Zimmer links ist Zimmer 1.",
          "Per trovare la camera 1, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La prima camera a sinistra è la camera 1.",
          "Aby znaleźć pokój 1, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Pierwszy pokój po lewej stronie to pokój 1.",
          "Щоб знайти кімнату 1, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Перша кімната ліворуч — це кімната 1."
        ),
        keywords: [
          "szoba 1",
          "szoba egy",
          "1-es szoba",
          "room 1",
          "where is room 1",
          "zimmer 1",
          "camera 1",
          "pokój 1",
          "кімната 1",
        ],
      },
      {
        id: "szoba2",
        label: tr(
          "Szoba 2",
          "Room 2",
          "Zimmer 2",
          "Camera 2",
          "Pokój 2",
          "Кімната 2"
        ),
        answer: tr(
          "A 2-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Balra a második szoba a 2-es szoba.",
          "To find room 2, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The second room on the left is room 2.",
          "Um Zimmer 2 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das zweite Zimmer links ist Zimmer 2.",
          "Per trovare la camera 2, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La seconda camera a sinistra è la camera 2.",
          "Aby znaleźć pokój 2, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Drugi pokój po lewej stronie to pokój 2.",
          "Щоб знайти кімнату 2, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Друга кімната ліворуч — це кімната 2."
        ),
        keywords: [
          "szoba 2",
          "szoba kettő",
          "2-es szoba",
          "room 2",
          "where is room 2",
          "zimmer 2",
          "camera 2",
          "pokój 2",
          "кімната 2",
        ],
      },
      {
        id: "szoba3",
        label: tr(
          "Szoba 3",
          "Room 3",
          "Zimmer 3",
          "Camera 3",
          "Pokój 3",
          "Кімната 3"
        ),
        answer: tr(
          "A 3-as szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Balra a harmadik szoba a 3-as szoba.",
          "To find room 3, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The third room on the left is room 3.",
          "Um Zimmer 3 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das dritte Zimmer links ist Zimmer 3.",
          "Per trovare la camera 3, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La terza camera a sinistra è la camera 3.",
          "Aby znaleźć pokój 3, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Trzeci pokój po lewej stronie to pokój 3.",
          "Щоб знайти кімнату 3, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Третя кімната ліворуч — це кімната 3."
        ),
        keywords: [
          "szoba 3",
          "szoba három",
          "3-as szoba",
          "room 3",
          "where is room 3",
          "zimmer 3",
          "camera 3",
          "pokój 3",
          "кімната 3",
        ],
      },
      {
        id: "szoba4",
        label: tr(
          "Szoba 4",
          "Room 4",
          "Zimmer 4",
          "Camera 4",
          "Pokój 4",
          "Кімната 4"
        ),
        answer: tr(
          "A 4-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Balra a negyedik szoba a 4-es szoba.",
          "To find room 4, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The fourth room on the left is room 4.",
          "Um Zimmer 4 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das vierte Zimmer links ist Zimmer 4.",
          "Per trovare la camera 4, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La quarta camera a sinistra è la camera 4.",
          "Aby znaleźć pokój 4, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Czwarty pokój po lewej stronie to pokój 4.",
          "Щоб знайти кімнату 4, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Четверта кімната ліворуч — це кімната 4."
        ),
        keywords: [
          "szoba 4",
          "szoba négy",
          "4-es szoba",
          "room 4",
          "where is room 4",
          "zimmer 4",
          "camera 4",
          "pokój 4",
          "кімната 4",
        ],
      },
      {
        id: "szoba5",
        label: tr(
          "Szoba 5",
          "Room 5",
          "Zimmer 5",
          "Camera 5",
          "Pokój 5",
          "Кімната 5"
        ),
        answer: tr(
          "Az 5-ös szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Jobbra a második szoba az 5-ös szoba.",
          "To find room 5, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The second room on the right is room 5.",
          "Um Zimmer 5 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das zweite Zimmer rechts ist Zimmer 5.",
          "Per trovare la camera 5, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La seconda camera a destra è la camera 5.",
          "Aby znaleźć pokój 5, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Drugi pokój po prawej stronie to pokój 5.",
          "Щоб знайти кімнату 5, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Друга кімната праворуч — це кімната 5."
        ),
        keywords: [
          "szoba 5",
          "szoba öt",
          "5-ös szoba",
          "room 5",
          "where is room 5",
          "zimmer 5",
          "camera 5",
          "pokój 5",
          "кімната 5",
        ],
      },
      {
        id: "szoba6",
        label: tr(
          "Szoba 6",
          "Room 6",
          "Zimmer 6",
          "Camera 6",
          "Pokój 6",
          "Кімната 6"
        ),
        answer: tr(
          "A 6-os szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Jobbra a harmadik szoba a 6-os szoba.",
          "To find room 6, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The third room on the right is room 6.",
          "Um Zimmer 6 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das dritte Zimmer rechts ist Zimmer 6.",
          "Per trovare la camera 6, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La terza camera a destra è la camera 6.",
          "Aby znaleźć pokój 6, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Trzeci pokój po prawej stronie to pokój 6.",
          "Щоб знайти кімнату 6, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Третя кімната праворуч — це кімната 6."
        ),
        keywords: [
          "szoba 6",
          "szoba hat",
          "6-os szoba",
          "room 6",
          "where is room 6",
          "zimmer 6",
          "camera 6",
          "pokój 6",
          "кімната 6",
        ],
      },
      {
        id: "szoba7",
        label: tr(
          "Szoba 7",
          "Room 7",
          "Zimmer 7",
          "Camera 7",
          "Pokój 7",
          "Кімната 7"
        ),
        answer: tr(
          "A 7-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Jobbra a negyedik szoba a 7-es szoba.",
          "To find room 7, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. The fourth room on the right is room 7.",
          "Um Zimmer 7 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Das vierte Zimmer rechts ist Zimmer 7.",
          "Per trovare la camera 7, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. La quarta camera a destra è la camera 7.",
          "Aby znaleźć pokój 7, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Czwarty pokój po prawej stronie to pokój 7.",
          "Щоб знайти кімнату 7, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Четверта кімната праворуч — це кімната 7."
        ),
        keywords: [
          "szoba 7",
          "szoba hét",
          "7-es szoba",
          "room 7",
          "where is room 7",
          "zimmer 7",
          "camera 7",
          "pokój 7",
          "кімната 7",
        ],
      },
      {
        id: "szoba8",
        label: tr(
          "Szoba 8",
          "Room 8",
          "Zimmer 8",
          "Camera 8",
          "Pokój 8",
          "Кімната 8"
        ),
        answer: tr(
          "A 8-as szobát úgy találja meg, hogy tovább halad a recepció mellett. Jobbra a 8-as felirat jelzi a szobát. A kulcsot a zárban találja.",
          "To find room 8, continue past the reception. On the right, the number 8 marks the room. You will find the key in the lock.",
          "Um Zimmer 8 zu finden, gehen Sie an der Rezeption vorbei weiter. Rechts zeigt die Nummer 8 das Zimmer an. Den Schlüssel finden Sie im Schloss.",
          "Per trovare la camera 8, continui oltre la reception. Sulla destra il numero 8 indica la camera. Troverà la chiave nella serratura.",
          "Aby znaleźć pokój 8, proszę iść dalej obok recepcji. Po prawej stronie numer 8 oznacza pokój. Klucz znajduje się w zamku.",
          "Щоб знайти кімнату 8, пройдіть далі повз рецепцію. Праворуч номер 8 позначає кімнату. Ключ ви знайдете в замку."
        ),
        keywords: [
          "szoba 8",
          "szoba nyolc",
          "8-as szoba",
          "room 8",
          "where is room 8",
          "zimmer 8",
          "camera 8",
          "pokój 8",
          "кімната 8",
        ],
      },
    ],
    []
  );

  const apartmentItems: MenuItem[] = useMemo(
    () => [
      {
        id: "apartman1",
        label: tr(
          "Apartman 1",
          "Apartment 1",
          "Apartment 1",
          "Appartamento 1",
          "Apartament 1",
          "Апартамент 1"
        ),
        answer: tr(
          "Az Apartman 1-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Jobb oldalon találja az utolsó előtti ajtót A 1 feliratot. A kulcs a zárban van.",
          "To find apartment 1, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. On the right side you will find the second to last door marked A 1. The key is in the lock.",
          "Um Apartment 1 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Auf der rechten Seite finden Sie die vorletzte Tür mit der Aufschrift A 1. Der Schlüssel steckt im Schloss.",
          "Per trovare l'appartamento 1, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. Sul lato destro troverà la penultima porta con la scritta A 1. La chiave è nella serratura.",
          "Aby znaleźć apartament 1, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Po prawej stronie znajdzie Pan przedostatnie drzwi oznaczone A 1. Klucz jest w zamku.",
          "Щоб знайти апартамент 1, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Праворуч ви побачите передостанні двері з написом A 1. Ключ у замку."
        ),
        keywords: [
          "apartman 1",
          "1-es apartman",
          "apartment 1",
          "appartamento 1",
          "apartament 1",
          "апартамент 1",
        ],
      },
      {
        id: "apartman2",
        label: tr(
          "Apartman 2",
          "Apartment 2",
          "Apartment 2",
          "Appartamento 2",
          "Apartament 2",
          "Апартамент 2"
        ),
        answer: tr(
          "Az Apartman 2-es szobát úgy találja meg, hogy elindul az épület mellett. Hátul jobbra fordul. Ott megtalálja a lépcsőt. Felmegy az első emeletre. Bal oldalon találja az utolsó előtti ajtót A 2 feliratot. A kulcs a zárban van.",
          "To find apartment 2, walk along the building. Turn right at the back. There you will find the stairs. Go up to the first floor. On the left side you will find the second to last door marked A 2. The key is in the lock.",
          "Um Apartment 2 zu finden, gehen Sie am Gebäude entlang. Hinten biegen Sie rechts ab. Dort finden Sie die Treppe. Gehen Sie in den ersten Stock. Auf der linken Seite finden Sie die vorletzte Tür mit der Aufschrift A 2. Der Schlüssel steckt im Schloss.",
          "Per trovare l'appartamento 2, cammini lungo l'edificio. In fondo giri a destra. Lì troverà le scale. Salga al primo piano. Sul lato sinistro troverà la penultima porta con la scritta A 2. La chiave è nella serratura.",
          "Aby znaleźć apartament 2, proszę iść wzdłuż budynku. Z tyłu skręcić w prawo. Tam znajdzie Pan schody. Proszę wejść na pierwsze piętro. Po lewej stronie znajdzie Pan przedostatnie drzwi oznaczone A 2. Klucz jest w zamku.",
          "Щоб знайти апартамент 2, пройдіть уздовж будівлі. Позаду поверніть праворуч. Там ви знайдете сходи. Підніміться на перший поверх. Ліворуч ви побачите передостанні двері з написом A 2. Ключ у замку."
        ),
        keywords: [
          "apartman 2",
          "2-es apartman",
          "apartment 2",
          "appartamento 2",
          "apartament 2",
          "апартамент 2",
        ],
      },
      {
        id: "apartman3",
        label: tr(
          "Apartman 3",
          "Apartment 3",
          "Apartment 3",
          "Appartamento 3",
          "Apartament 3",
          "Апартамент 3"
        ),
        answer: tr(
          "Az Apartman 3 szobát úgy találja meg, hogy tovább halad a recepció mellett. Jobbra az A 3 felirat jelzi a szobát. A kulcsot a zárban találja.",
          "To find apartment 3, continue past the reception. On the right, the A 3 sign marks the room. You will find the key in the lock.",
          "Um Apartment 3 zu finden, gehen Sie an der Rezeption vorbei weiter. Rechts zeigt die Aufschrift A 3 das Zimmer an. Den Schlüssel finden Sie im Schloss.",
          "Per trovare l'appartamento 3, continui oltre la reception. Sulla destra l'insegna A 3 indica la camera. Troverà la chiave nella serratura.",
          "Aby znaleźć apartament 3, proszę iść dalej obok recepcji. Po prawej stronie oznaczenie A 3 wskazuje pokój. Klucz znajduje się w zamku.",
          "Щоб знайти апартамент 3, пройдіть далі повз рецепцію. Праворуч напис A 3 позначає кімнату. Ключ ви знайдете в замку."
        ),
        keywords: [
          "apartman 3",
          "3-as apartman",
          "apartment 3",
          "appartamento 3",
          "apartament 3",
          "апартамент 3",
        ],
      },
      {
        id: "apartman4",
        label: tr(
          "Apartman 4",
          "Apartment 4",
          "Apartment 4",
          "Appartamento 4",
          "Apartament 4",
          "Апартамент 4"
        ),
        answer: tr(
          "Az Apartman 4 szobát úgy találja meg, hogy megkerüli az épületet. Megkeresi az A 4-es feliratot. A kulcs a zárba be van készítve.",
          "To find apartment 4, walk around the building. Look for the A 4 sign. The key is already placed in the lock.",
          "Um Apartment 4 zu finden, gehen Sie um das Gebäude herum. Suchen Sie nach der Aufschrift A 4. Der Schlüssel steckt bereits im Schloss.",
          "Per trovare l'appartamento 4, faccia il giro dell'edificio. Cerchi l'insegna A 4. La chiave è già inserita nella serratura.",
          "Aby znaleźć apartament 4, proszę obejść budynek. Proszę szukać oznaczenia A 4. Klucz jest już włożony do zamka.",
          "Щоб знайти апартамент 4, обійдіть будівлю. Знайдіть позначення A 4. Ключ уже вставлено в замок."
        ),
        keywords: [
          "apartman 4",
          "4-es apartman",
          "apartment 4",
          "appartamento 4",
          "apartament 4",
          "апартамент 4",
        ],
      },
      {
        id: "apartman5",
        label: tr(
          "Apartman 5",
          "Apartment 5",
          "Apartment 5",
          "Appartamento 5",
          "Apartament 5",
          "Апартамент 5"
        ),
        answer: tr(
          "Az Apartman 5 szobát úgy találja meg, hogy tovább halad a recepció mellett. Az épület hátsó felénél jobbra fordul. A lépcsővel szemben találja az A 5 feliratot. A kulcs a zárba be van készítve.",
          "To find apartment 5, continue past the reception. At the back side of the building, turn right. Opposite the stairs you will find the A 5 sign. The key is already placed in the lock.",
          "Um Apartment 5 zu finden, gehen Sie an der Rezeption vorbei weiter. Auf der Rückseite des Gebäudes biegen Sie rechts ab. Gegenüber der Treppe finden Sie die Aufschrift A 5. Der Schlüssel steckt bereits im Schloss.",
          "Per trovare l'appartamento 5, continui oltre la reception. Sul retro dell'edificio giri a destra. Di fronte alle scale troverà l'insegna A 5. La chiave è già inserita nella serratura.",
          "Aby znaleźć apartament 5, proszę iść dalej obok recepcji. Z tyłu budynku proszę skręcić w prawo. Naprzeciw schodów znajdzie Pan oznaczenie A 5. Klucz jest już włożony do zamka.",
          "Щоб знайти апартамент 5, пройдіть далі повз рецепцію. На задній стороні будівлі поверніть праворуч. Навпроти сходів ви знайдете позначення A 5. Ключ уже вставлено в замок."
        ),
        keywords: [
          "apartman 5",
          "5-ös apartman",
          "apartment 5",
          "appartamento 5",
          "apartament 5",
          "апартамент 5",
        ],
      },
    ],
    []
  );

  const relaxItems: MenuItem[] = useMemo(
    () => [
      {
        id: "relax1",
        label: tr(
          "Relax 1",
          "Relax 1",
          "Relax 1",
          "Relax 1",
          "Relax 1",
          "Relax 1"
        ),
        answer: tr(
          "A Relax 1 szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett egy másik épülethez. Megkerüli a medence felől az épületet. Ott találja az R 1 feliratot. A kulcsot a zárban találja.",
          "To find Relax 1, walk towards the back and pass the sauna to another building. Walk around the building from the pool side. There you will find the R 1 sign. The key is in the lock.",
          "Um Relax 1 zu finden, gehen Sie nach hinten und an der Sauna vorbei zu einem anderen Gebäude. Gehen Sie auf der Poolseite um das Gebäude herum. Dort finden Sie die Aufschrift R 1. Der Schlüssel steckt im Schloss.",
          "Per trovare Relax 1, vada verso il retro e passi accanto alla sauna fino a un altro edificio. Faccia il giro dell'edificio dal lato della piscina. Lì troverà l'insegna R 1. La chiave è nella serratura.",
          "Aby znaleźć Relax 1, proszę iść do tyłu i minąć saunę w kierunku drugiego budynku. Proszę obejść budynek od strony basenu. Tam znajdzie Pan oznaczenie R 1. Klucz jest w zamku.",
          "Щоб знайти Relax 1, пройдіть назад повз сауну до іншої будівлі. Обійдіть будівлю з боку басейну. Там ви знайдете позначення R 1. Ключ у замку."
        ),
        keywords: ["relax 1", "1-es relax", "relax room 1", "relax 1 room"],
      },
      {
        id: "relax2",
        label: tr(
          "Relax 2",
          "Relax 2",
          "Relax 2",
          "Relax 2",
          "Relax 2",
          "Relax 2"
        ),
        answer: tr(
          "A Relax 2 szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett egy másik épülethez. Megkerüli a medence felől az épületet. Ott találja az R 2 feliratot. A kulcsot a zárban találja.",
          "To find Relax 2, walk towards the back and pass the sauna to another building. Walk around the building from the pool side. There you will find the R 2 sign. The key is in the lock.",
          "Um Relax 2 zu finden, gehen Sie nach hinten und an der Sauna vorbei zu einem anderen Gebäude. Gehen Sie auf der Poolseite um das Gebäude herum. Dort finden Sie die Aufschrift R 2. Der Schlüssel steckt im Schloss.",
          "Per trovare Relax 2, vada verso il retro e passi accanto alla sauna fino a un altro edificio. Faccia il giro dell'edificio dal lato della piscina. Lì troverà l'insegna R 2. La chiave è nella serratura.",
          "Aby znaleźć Relax 2, proszę iść do tyłu i minąć saunę w kierunku drugiego budynku. Proszę obejść budynek od strony basenu. Tam znajdzie Pan oznaczenie R 2. Klucz jest w zamku.",
          "Щоб знайти Relax 2, пройдіть назад повз сауну до іншої будівлі. Обійдіть будівлю з боку басейну. Там ви знайдете позначення R 2. Ключ у замку."
        ),
        keywords: ["relax 2", "2-es relax", "relax room 2", "relax 2 room"],
      },
      {
        id: "relax3",
        label: tr(
          "Relax 3",
          "Relax 3",
          "Relax 3",
          "Relax 3",
          "Relax 3",
          "Relax 3"
        ),
        answer: tr(
          "A Relax 3 szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett egy másik épülethez. Megkerüli a medence felől az épületet. Ott találja az R 3 feliratot. A kulcsot a zárban találja.",
          "To find Relax 3, walk towards the back and pass the sauna to another building. Walk around the building from the pool side. There you will find the R 3 sign. The key is in the lock.",
          "Um Relax 3 zu finden, gehen Sie nach hinten und an der Sauna vorbei zu einem anderen Gebäude. Gehen Sie auf der Poolseite um das Gebäude herum. Dort finden Sie die Aufschrift R 3. Der Schlüssel steckt im Schloss.",
          "Per trovare Relax 3, vada verso il retro e passi accanto alla sauna fino a un altro edificio. Faccia il giro dell'edificio dal lato della piscina. Lì troverà l'insegna R 3. La chiave è nella serratura.",
          "Aby znaleźć Relax 3, proszę iść do tyłu i minąć saunę w kierunku drugiego budynku. Proszę obejść budynek od strony basenu. Tam znajdzie Pan oznaczenie R 3. Klucz jest w zamku.",
          "Щоб знайти Relax 3, пройдіть назад повз сауну до іншої будівлі. Обійдіть будівлю з боку басейну. Там ви знайдете позначення R 3. Ключ у замку."
        ),
        keywords: ["relax 3", "3-es relax", "relax room 3", "relax 3 room"],
      },
      {
        id: "relax4",
        label: tr(
          "Relax 4",
          "Relax 4",
          "Relax 4",
          "Relax 4",
          "Relax 4",
          "Relax 4"
        ),
        answer: tr(
          "A Relax 4 szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett. Egy másik épülethez ér. Ott találja az R 4 feliratot. A kulcsot a zárban találja.",
          "To find Relax 4, walk towards the back and pass the sauna. You will arrive at another building. There you will find the R 4 sign. The key is in the lock.",
          "Um Relax 4 zu finden, gehen Sie nach hinten und an der Sauna vorbei. Sie kommen zu einem anderen Gebäude. Dort finden Sie die Aufschrift R 4. Der Schlüssel steckt im Schloss.",
          "Per trovare Relax 4, vada verso il retro e passi accanto alla sauna. Arriverà a un altro edificio. Lì troverà l'insegna R 4. La chiave è nella serratura.",
          "Aby znaleźć Relax 4, proszę iść do tyłu i minąć saunę. Dojdzie Pan do drugiego budynku. Tam znajdzie Pan oznaczenie R 4. Klucz jest w zamku.",
          "Щоб знайти Relax 4, пройдіть назад повз сауну. Ви дійдете до іншої будівлі. Там ви знайдете позначення R 4. Ключ у замку."
        ),
        keywords: ["relax 4", "4-es relax", "relax room 4", "relax 4 room"],
      },
      {
        id: "relaxpremium",
        label: tr(
          "Relax Prémium",
          "Relax Premium",
          "Relax Premium",
          "Relax Premium",
          "Relax Premium",
          "Relax Premium"
        ),
        answer: tr(
          "A Relax Prémium szobát úgy találja meg, hogy elindul hátrafelé, elmegy a szauna mellett egy másik épülethez. Felmegy a lépcsőn. Ott találja az R P feliratot. A kulcsot a zárban találja.",
          "To find Relax Premium, walk towards the back and pass the sauna to another building. Go up the stairs. There you will find the R P sign. The key is in the lock.",
          "Um Relax Premium zu finden, gehen Sie nach hinten und an der Sauna vorbei zu einem anderen Gebäude. Gehen Sie die Treppe hinauf. Dort finden Sie die Aufschrift R P. Der Schlüssel steckt im Schloss.",
          "Per trovare Relax Premium, vada verso il retro e passi accanto alla sauna fino a un altro edificio. Salga le scale. Lì troverà l'insegna R P. La chiave è nella serratura.",
          "Aby znaleźć Relax Premium, proszę iść do tyłu i minąć saunę w kierunku drugiego budynku. Proszę wejść po schodach. Tam znajdzie Pan oznaczenie R P. Klucz jest w zamku.",
          "Щоб знайти Relax Premium, пройдіть назад повз сауну до іншої будівлі. Підніміться сходами. Там ви знайдете позначення R P. Ключ у замку."
        ),
        keywords: [
          "relax premium",
          "relax prémium",
          "premium relax",
          "prémium relax",
          "rp",
        ],
      },
    ],
    []
  );

  const faqItems: MenuItem[] = useMemo(
    () => [
      {
        id: "reggeli",
        label: tr(
          "Reggeli",
          "Breakfast",
          "Frühstück",
          "Colazione",
          "Śniadanie",
          "Сніданок"
        ),
        answer: tr(
          "A reggeli minden nap 8:00 és 10:00 között érhető el. A reggeli ára 8 euro per fő per nap.",
          "Breakfast is available every day between 8:00 and 10:00. The price is 8 euro per person per day.",
          "Das Frühstück ist täglich zwischen 8:00 und 10:00 Uhr verfügbar. Der Preis beträgt 8 Euro pro Person und Tag.",
          "La colazione è disponibile ogni giorno dalle 8:00 alle 10:00. Il prezzo è di 8 euro a persona al giorno.",
          "Śniadanie jest dostępne codziennie od 8:00 do 10:00. Cena wynosi 8 euro za osobę za dzień.",
          "Сніданок доступний щодня з 8:00 до 10:00. Вартість — 8 євро з особи на день."
        ),
        keywords: [
          "reggeli",
          "breakfast",
          "frühstück",
          "colazione",
          "śniadanie",
          "сніданок",
        ],
      },
      {
        id: "wifi",
        label: tr("Wifi", "Wifi", "WLAN", "Wifi", "Wifi", "Wi-Fi"),
        answer: tr(
          "A wifi neve SilverGarden. A jelszó balatonlive kisbetűvel egybeírva.",
          "The wifi name is SilverGarden. The password is balatonlive in lowercase, written together.",
          "Das WLAN heißt SilverGarden. Das Passwort ist balatonlive, klein geschrieben und zusammen.",
          "Il nome del wifi è SilverGarden. La password è balatonlive in minuscolo, tutto attaccato.",
          "Nazwa wifi to SilverGarden. Hasło to balatonlive, małymi literami, bez spacji.",
          "Назва Wi-Fi — SilverGarden. Пароль — balatonlive, маленькими літерами, без пробілів."
        ),
        keywords: ["wifi", "wi-fi", "internet", "wlan"],
      },
      {
        id: "parkolas",
        label: tr(
          "Parkolás",
          "Parking",
          "Parken",
          "Parcheggio",
          "Parking",
          "Паркування"
        ),
        answer: tr(
          "A vendégek számára ingyenes parkoló áll rendelkezésre az épület előtt az utcai parkolóban.",
          "Free parking is available for guests in the street parking area in front of the building.",
          "Für Gäste stehen kostenlose Parkplätze vor dem Gebäude auf den Straßenparkplätzen zur Verfügung.",
          "Per gli ospiti è disponibile un parcheggio gratuito davanti all'edificio, nei posti auto sulla strada.",
          "Dla gości dostępny jest bezpłatny parking przed budynkiem, na miejscach parkingowych przy ulicy.",
          "Для гостей доступне безкоштовне паркування перед будівлею на вуличних місцях."
        ),
        keywords: [
          "parkol",
          "parkolás",
          "parking",
          "parcheggio",
          "parken",
          "паркування",
        ],
      },
      {
        id: "wellnesz",
        label: tr(
          "Wellnesz",
          "Wellness",
          "Wellness",
          "Wellness",
          "Wellness",
          "Велнес"
        ),
        answer: tr(
          "A wellnesz a vendégek számára díj ellenében érhető el. A szauna használat 4000 forint per fő per 3 óra. Megrendeléstől számított 2 órán belül használható.",
          "The wellness area is available to guests for an extra fee. Sauna use costs 4000 forints per person for 3 hours. It can be used within 2 hours after ordering.",
          "Der Wellnessbereich steht den Gästen gegen Gebühr zur Verfügung. Die Saunanutzung kostet 4000 Forint pro Person für 3 Stunden. Sie kann innerhalb von 2 Stunden nach der Bestellung genutzt werden.",
          "L'area wellness è disponibile per gli ospiti a pagamento. L'uso della sauna costa 4000 fiorini a persona per 3 ore. È utilizzabile entro 2 ore dalla prenotazione.",
          "Strefa wellness jest dostępna dla gości za dodatkową opłatą. Korzystanie z sauny kosztuje 4000 forintów za osobę na 3 godziny. Można z niej skorzystać w ciągu 2 godzin od zamówienia.",
          "Велнес-зона доступна для гостей за додаткову плату. Користування сауною коштує 4000 форинтів з особи за 3 години. Нею можна скористатися протягом 2 годин після замовлення."
        ),
        keywords: ["wellness", "wellnesz", "spa", "szauna", "sauna"],
      },
      {
        id: "checkout",
        label: tr(
          "Kijelentkezés",
          "Check-out",
          "Check-out",
          "Check-out",
          "Wymeldowanie",
          "Виїзд"
        ),
        answer: tr(
          "A kijelentkezés legkésőbb 10:00 óráig lehetséges. Megkérjük vendégeinket a kulcsot hagyják a szobaajtóban.",
          "Check-out is possible until 10:00 at the latest. We ask our guests to leave the key in the room door.",
          "Der Check-out ist spätestens bis 10:00 Uhr möglich. Wir bitten unsere Gäste, den Schlüssel in der Zimmertür zu lassen.",
          "Il check-out è possibile entro le 10:00 al più tardi. Chiediamo gentilmente ai nostri ospiti di lasciare la chiave nella serratura della camera.",
          "Wymeldowanie jest możliwe najpóźniej do godziny 10:00. Prosimy naszych gości o pozostawienie klucza w drzwiach pokoju.",
          "Виїзд можливий не пізніше 10:00. Ми просимо наших гостей залишати ключ у дверях номера."
        ),
        keywords: [
          "kijelentkezés",
          "checkout",
          "check-out",
          "check out",
          "wymeldowanie",
          "виїзд",
        ],
      },
      {
        id: "checkin",
        label: tr(
          "Bejelentkezés",
          "Check-in",
          "Check-in",
          "Check-in",
          "Zameldowanie",
          "Заселення"
        ),
        answer: tr(
          "A bejelentkezés 14:00 órától lehetséges.",
          "Check-in is possible from 14:00.",
          "Der Check-in ist ab 14:00 Uhr möglich.",
          "Il check-in è possibile dalle 14:00.",
          "Zameldowanie jest możliwe od godziny 14:00.",
          "Заселення можливе з 14:00."
        ),
        keywords: [
          "bejelentkezés",
          "checkin",
          "check-in",
          "check in",
          "zameldowanie",
          "заселення",
        ],
      },
      {
        id: "recepcio",
        label: tr(
          "Recepció",
          "Reception",
          "Rezeption",
          "Reception",
          "Recepcja",
          "Рецепція"
        ),
        answer: tr(
          "Ebben egy kollégám fog segíteni. Kérem, egy pillanat türelmet.",
          "A colleague will help you with this. Please wait a moment.",
          "Ein Kollege wird Ihnen dabei helfen. Bitte einen Moment Geduld.",
          "Un collega la aiuterà. Attenda un momento, per favore.",
          "W tej sprawie pomoże Panu kolega. Proszę o chwilę cierpliwości.",
          "У цьому вам допоможе мій колега. Будь ласка, зачекайте хвилинку."
        ),
        keywords: [
          "recepció",
          "reception",
          "rezeption",
          "recepcja",
          "рецепція",
        ],
      },
      {
        id: "kapu",
        label: tr("Kapu", "Gate", "Tor", "Cancello", "Brama", "Ворота"),
        answer: tr(
          "A kapu éjszaka nyitva van. Bármikor kulcs nélkül be lehet jutni.",
          "The gate is open at night. You can enter at any time without a key.",
          "Das Tor ist nachts offen. Sie können jederzeit ohne Schlüssel eintreten.",
          "Il cancello è aperto di notte. Si può entrare in qualsiasi momento senza chiave.",
          "Brama jest otwarta w nocy. Można wejść w każdej chwili bez klucza.",
          "Ворота вночі відкриті. Ви можете зайти будь-коли без ключа."
        ),
        keywords: ["kapu", "gate", "tor", "cancello", "brama", "ворота"],
      },
      {
        id: "hazirend",
        label: tr(
          "Házirend",
          "House rules",
          "Hausordnung",
          "Regole della casa",
          "Zasady domu",
          "Правила внутрішнього розпорядку"
        ),
        answer: tr(
          "Házirend. A medence szabályzat 9 órától 21 óráig. Üveg poharat a kertben használni tilos. Kültéri eszközöket használat után szíveskedjenek tisztán tartani. A hulladékot és az ételmaradékot a tárolókonténerbe szíveskedjenek kiüríteni.",
          "House rules. Pool rules apply from 9:00 to 21:00. Glass cups are not allowed in the garden. Please keep outdoor equipment clean after use. Please empty waste and food leftovers into the storage container.",
          "Hausordnung. Die Poolregeln gelten von 9:00 bis 21:00 Uhr. Glasbecher sind im Garten nicht erlaubt. Bitte reinigen Sie die Außengeräte nach Gebrauch. Bitte entsorgen Sie Abfall und Speisereste im Container.",
          "Regole della casa. Le regole della piscina valgono dalle 9:00 alle 21:00. È vietato usare bicchieri di vetro in giardino. Si prega di tenere pulite le attrezzature esterne dopo l’uso. Si prega di svuotare rifiuti e avanzi di cibo nel contenitore.",
          "Zasady domu. Zasady korzystania z basenu obowiązują od 9:00 do 21:00. Szklane kubki są zabronione w ogrodzie. Prosimy o utrzymanie sprzętu zewnętrznego w czystości po użyciu. Prosimy o wyrzucanie odpadów i resztek jedzenia do pojemnika.",
          "Правила проживання. Правила басейну діють з 9:00 до 21:00. Скляний посуд заборонено використовувати в саду. Будь ласка, тримайте в чистоті вуличне обладнання після використання. Будь ласка, викидайте сміття та залишки їжі в контейнер."
        ),
        keywords: [
          "házirend",
          "hazirend",
          "házi rend",
          "hazi rend",
          "szabályzat",
          "house rules",
          "hausordnung",
          "regole della casa",
          "zasady domu",
          "правила",
        ],
      },
      {
        id: "kisallat",
        label: tr(
          "Kisállat",
          "Pet",
          "Haustier",
          "Animale domestico",
          "Zwierzę domowe",
          "Домашня тварина"
        ),
        answer: tr(
          "Kisállat felár ellenében behozható a szálláshelyre előzetes bejelentés alapján. Ár: 10 euro per éj. Nem bejelentett kisállat után extraköltséget számítunk fel.",
          "Pets can be brought to the accommodation for an extra fee with prior notice. Price: 10 euro per night. Extra charges apply for undeclared pets.",
          "Haustiere können nach vorheriger Anmeldung gegen Aufpreis in die Unterkunft mitgebracht werden. Preis: 10 Euro pro Nacht. Für nicht angemeldete Haustiere wird ein Aufpreis berechnet.",
          "Gli animali domestici possono essere portati nella struttura con un costo aggiuntivo previa comunicazione anticipata. Prezzo: 10 euro a notte. Per animali non dichiarati verrà addebitato un costo extra.",
          "Zwierzęta domowe można przywieźć do obiektu za dodatkową opłatą po wcześniejszym zgłoszeniu. Cena: 10 euro za noc. Za niezgłoszone zwierzęta naliczana jest dodatkowa opłata.",
          "Домашніх тварин можна привозити до помешкання за додаткову плату після попереднього повідомлення. Ціна: 10 євро за ніч. За незаявлених тварин стягується додаткова плата."
        ),
        keywords: [
          "kisállat",
          "kisallat",
          "állat",
          "allat",
          "kutya",
          "macska",
          "pet",
          "haustier",
          "animale domestico",
          "zwierzę domowe",
          "домашня тварина",
        ],
      },
    ],
    []
  );

  const allVoiceItems = useMemo(
    () => [...faqItems, ...roomItems, ...apartmentItems, ...relaxItems],
    [faqItems, roomItems, apartmentItems, relaxItems]
  );

  useEffect(() => {
    setAnswer(getText(ui.welcome, selectedLanguage));
  }, [selectedLanguage, ui.welcome]);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        setVoices(allVoices);
      }
    };

    loadVoices();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;

      const t1 = window.setTimeout(loadVoices, 200);
      const t2 = window.setTimeout(loadVoices, 800);
      const t3 = window.setTimeout(loadVoices, 1500);

      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
        if (speakTimeoutRef.current) {
          window.clearTimeout(speakTimeoutRef.current);
        }
        window.speechSynthesis.cancel();
      };
    }

    return () => {
      if (speakTimeoutRef.current) {
        window.clearTimeout(speakTimeoutRef.current);
      }
    };
  }, []);

  const normalizeForSpeech = (text: string) => {
    return text
      .replace(/\s+/g, " ")
      .replace(/A\s*1/g, "A 1")
      .replace(/A\s*2/g, "A 2")
      .replace(/A\s*3/g, "A 3")
      .replace(/A\s*4/g, "A 4")
      .replace(/A\s*5/g, "A 5")
      .replace(/R\s*1/g, "R 1")
      .replace(/R\s*2/g, "R 2")
      .replace(/R\s*3/g, "R 3")
      .replace(/R\s*4/g, "R 4")
      .replace(/R\s*P/g, "R P")
      .trim();
  };

  const normalizeForMatch = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const pickBestVoice = (lang: LangCode) => {
    if (!voices.length) return null;

    const exact = voices.find(
      (voice) => voice.lang.toLowerCase() === lang.toLowerCase()
    );
    if (exact) return exact;

    const base = lang.toLowerCase().split("-")[0];

    const byBase = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith(base)
    );
    if (byBase) return byBase;

    return voices[0] || null;
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setAnswer(getText(ui.speechUnsupported, selectedLanguage));
      return;
    }

    const cleanedText = normalizeForSpeech(text);
    const voice = pickBestVoice(selectedLanguage);

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = voice?.lang || selectedLanguage;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.cancel();

    if (speakTimeoutRef.current) {
      window.clearTimeout(speakTimeoutRef.current);
    }

    speakTimeoutRef.current = window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 120);
  };

  const setAnswerAndSpeak = (text: string) => {
    setAnswer(text);
    speak(text);
  };

  const getResponse = (input: string): string => {
    const q = normalizeForMatch(input);

    const matchedItem = allVoiceItems.find((item) =>
      item.keywords.some((keyword) => q.includes(normalizeForMatch(keyword)))
    );

    if (matchedItem) {
      return getText(matchedItem.answer, selectedLanguage);
    }

    return getText(ui.fallback, selectedLanguage);
  };

  const startListening = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAnswer(getText(ui.recognitionUnsupported, selectedLanguage));
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setAnswer(getText(ui.micDenied, selectedLanguage));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setHeardText(getText(ui.listening, selectedLanguage));
      setAnswer(getText(ui.speakNow, selectedLanguage));
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setHeardText(transcript);

      const response = getResponse(transcript);
      setAnswerAndSpeak(response);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setHeardText("");
      setAnswer(`Beszédfelismerési hiba: ${event.error || "ismeretlen hiba"}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleItemClick = (item: MenuItem) => {
    setAnswerAndSpeak(getText(item.answer, selectedLanguage));
  };

  const sectionWrapperStyle = (background: string) => ({
    maxWidth: "1100px",
    width: "100%",
    marginBottom: "20px",
    background,
    border: "1px solid rgba(120, 98, 74, 0.12)",
    borderRadius: "18px",
    padding: "22px 18px",
    boxShadow: "0 4px 14px rgba(80, 60, 40, 0.05)",
  });

  const menuButtonStyle: React.CSSProperties = {
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

  const renderMenuButtons = (items: MenuItem[]) =>
    items.map((item) => (
      <button
        key={item.id}
        onClick={() => handleItemClick(item)}
        style={menuButtonStyle}
      >
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
        justifyContent: "center",
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
          0% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
        }
      `}</style>

      <div
        style={{
          position: "relative",
          width: "260px",
          height: "260px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
            animation: avatarIsActive
              ? "kataRingGlow 1.4s ease-in-out infinite"
              : "none",
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
            animation: avatarIsActive
              ? "kataPulse 1.05s ease-in-out infinite"
              : "kataFloat 3.5s ease-in-out infinite",
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
            maxWidth: "165px",
            lineHeight: 1.25,
            zIndex: 6,
            textAlign: "center",
          }}
        >
          {getText(ui.pressToTalk, selectedLanguage)}
        </div>

        <button
          onClick={startListening}
          title={
            isListening
              ? getText(ui.listening, selectedLanguage)
              : getText(ui.listen, selectedLanguage)
          }
          aria-label={
            isListening
              ? getText(ui.listening, selectedLanguage)
              : getText(ui.listen, selectedLanguage)
          }
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
            boxShadow: isListening
              ? "0 10px 24px rgba(166, 61, 47, 0.35)"
              : "0 10px 24px rgba(95, 125, 78, 0.28)",
            animation: isListening
              ? "kataPulse 1s ease-in-out infinite"
              : "none",
            zIndex: 7,
          }}
        >
          🎤
        </button>
      </div>

      <h1 style={{ fontSize: "40px", marginBottom: "10px", color: "#4b3f31" }}>
        Silver Garden Siófok
      </h1>

      <h2 style={{ marginBottom: "20px", color: "#6a5a48" }}>
        {getText(ui.subtitle, selectedLanguage)}
      </h2>

      <p style={{ marginBottom: "16px", fontSize: "18px", color: "#5a4e40" }}>
        {getText(ui.chooseLang, selectedLanguage)}
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "30px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "1100px",
        }}
      >
        {languageLabels.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelectedLanguage(lang.code)}
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              border:
                selectedLanguage === lang.code
                  ? "2px solid #9f8c72"
                  : "1px solid #d9cbb6",
              background:
                selectedLanguage === lang.code ? "#e9decd" : "#f7f1e7",
              color: "#4e4438",
              cursor: "pointer",
              boxShadow:
                selectedLanguage === lang.code
                  ? "0 4px 10px rgba(120,95,65,0.10)"
                  : "0 2px 6px rgba(0,0,0,0.04)",
              fontWeight: selectedLanguage === lang.code ? 700 : 500,
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div style={sectionWrapperStyle("#fcf8f2")}>
        <div
          style={{
            marginBottom: "18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "26px" }}>🛏️</div>

          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "#4b3f31",
              letterSpacing: "0.5px",
            }}
          >
            {getText(ui.rooms, selectedLanguage)}
          </h3>

          <div
            style={{
              width: "40px",
              height: "3px",
              background: "#c9b79c",
              borderRadius: "2px",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {renderMenuButtons(roomItems)}
        </div>
      </div>

      <div style={sectionWrapperStyle("#f8f2e9")}>
        <div
          style={{
            marginBottom: "18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "26px" }}>🏡</div>

          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "#4b3f31",
              letterSpacing: "0.5px",
            }}
          >
            {getText(ui.apartments, selectedLanguage)}
          </h3>

          <div
            style={{
              width: "40px",
              height: "3px",
              background: "#c9b79c",
              borderRadius: "2px",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {renderMenuButtons(apartmentItems)}
        </div>
      </div>

      <div style={sectionWrapperStyle("#fdf9f4")}>
        <div
          style={{
            marginBottom: "18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "26px" }}>🧖‍♂️</div>

          <h3
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "#4b3f31",
              letterSpacing: "0.5px",
            }}
          >
            {getText(ui.relax, selectedLanguage)}
          </h3>

          <div
            style={{
              width: "40px",
              height: "3px",
              background: "#c9b79c",
              borderRadius: "2px",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {renderMenuButtons(relaxItems)}
        </div>
      </div>

      <div style={sectionWrapperStyle("#f6efe5")}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {faqItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={menuButtonStyle}
            >
              {getText(item.label, selectedLanguage)}
            </button>
          ))}
        </div>
      </div>

      <div
  style={{
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "20px",
  }}
>
  <button
    onClick={() => {
      const phoneNumber = "36709469181";
      const message = encodeURIComponent(
        `Szia, recepcióst kérek. Nyelv: ${selectedLanguage}.`
      );
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    }}
    style={{
      padding: "20px",
      fontSize: "18px",
      background: "#4f463d",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0,0,0,0.10)",
    }}
  >
    {getText(ui.askReception, selectedLanguage)}
  </button>

  <button
    onClick={() => {
      setShowEmergency(true);
      window.location.href = "tel:+36704089437";
    }}
    style={{
      padding: "20px",
      fontSize: "18px",
      background: "linear-gradient(180deg, #e53935 0%, #b71c1c 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(183,28,28,0.35)",
      fontWeight: 700,
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
    📞 +36 70 408 9437
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
        <div style={{ marginTop: "8px", color: "#6b5b49" }}>
          {heardText || "—"}
        </div>
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
    </div>
  );
}