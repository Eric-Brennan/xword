import License from "./license";
import Meaning from "./meaning";
import Phonetic from "./phonetic";

export interface DictionaryLookup {
    word: string;
    phonetic: string;
    phonetics: Phonetic[];
    meanings: Meaning[];
    license: License;
    sourceUrls: string[];
    correct: boolean;
}

