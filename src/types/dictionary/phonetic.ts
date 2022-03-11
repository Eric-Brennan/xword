import License from "./license";

export default interface Phonetic {
    text: string;
    audio: string;
    sourceUrl: string;
    license: License;
}