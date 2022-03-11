<template>
    <div class="home">
        <div class="h-80">
            <Board v-if="firstWord"
                   :first-word="firstWord"
                   :current-word="currentWord"
                   @word-added="wordAdded"></Board>
        </div>
        <div class="h-20">
            <div class="h-100">
                <Controls :wordIndex="wordIndex"
                          @new-word="setNewWord"
                          @initial-word="setFirstWord"></Controls>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Options, Vue } from "vue-class-component";
    import Board from "@/components/game/Board.vue"; // @ is an alias to /src
    import Controls from "@/components/game/Controls.vue";
import { DictionaryLookup } from "../types/dictionary/word-definition";
import GameWord from "../types/word";
    @Options({
        components: {
            Board,
            Controls
        },
    })
    export default class Home extends Vue {

        wordIndex = 0;

        currentWord: DictionaryLookup | null = null;
        firstWord: DictionaryLookup | null = null;

        setNewWord(word: DictionaryLookup) {
            this.currentWord = word;
        }

        setFirstWord(word: DictionaryLookup) {
            this.firstWord = word;
        }

        wordAdded(word: GameWord) {
            this.wordIndex++;
        }
    }
</script>
<style lang="scss">
    .home {
        height: 100%;
        width: 100%;
        max-width: 1122px;
        display:inline-flex;
        flex-direction:column;
        justify-self: center;
    }
</style>
