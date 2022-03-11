//@ts-ignore
import randomWords from 'random-words';
import axios from 'axios';
import { DictionaryLookup } from '../types/dictionary/word-definition';
export default class DictionaryService {

    getWord(length: number, prevWord?: string) {
        let p = false;
        while (!p) {
            const w1 = this.getW();
            if (w1.length === length) {
                if (!prevWord) {
                    p = true;
                    return w1;
                }

                w1.split('').forEach(l => {
                    prevWord.includes(l) ? p = true : null;
                })

                if (p) {
                    return w1;
                }
            }
        }

        return 'bad';
    }

    async getHint(word: string) {
        try {
            const r = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/` + word);

            if (r.status === 200) {
                return r.data[0] as DictionaryLookup;
            }

            throw new Error("Error with dictionary service")
        }
        catch (error) {
            throw new Error("Error with dictionary service")
        }
    }

    private getW() {
        return randomWords() as string;
    }
}