<template>
    <div class="controls">
        <div v-if="!wordSelected">
            <div class="p-15 font-medium">Select your next word!</div>
            <div class="d-flex align-center justify-around">
                <div class="wordButton wordButton-e" @click="newWord(1)"><div>Easy</div><div>5 pts</div></div>
                <div class="wordButton wordButton-m" @click="newWord(2)"><div>Medium</div><div>7 pts</div></div>
                <div class="wordButton wordButton-h" @click="newWord(3)"><div>Hard</div><div>10 pts</div></div>
            </div>
        </div>
        

        <div class="d-flex align-center justify-around d-flex-column"
             v-else>
            <div class="p-10" v-if="!placing">Current Word: {{currentLookup.word}}</div>
            <div v-else>
                <div class="p-10">Click a letter on the board to place your word!</div>
            </div>
            <div class="d-flex align-center justify-center word-border"
                 :class="correct ? 'word-border--correct' : ''">
                <div v-for="(char, index) in word"
                     :key="'currentWord'+index"
                     class="empty-square">
                    <input v-if="!similarIndex.find(i => i === index)"
                           type="text"
                           :disabled="correct"
                           :ref="'input'+index"
                           maxlength="1"
                           @input="tabNext($event, index)" />
                    <input v-else
                           disabled
                           type="text"
                           :ref="'input'+index"
                           maxlength="1"
                           @input="tabNext($event, index)"
                           :value="similarIndex.find(i => i === index) ? currentLookup.word.split('')[index]: value" />
                </div>
            </div>
            <div v-if="!placing" class="p-10">Hint: {{currentHint}}</div>
        </div>
    </div>
</template>

<script lang="ts">
    import { nextTick } from "vue";
    import { Options, Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
    import DictionaryService from "../../services/dictionary-service";
    import { DictionaryLookup } from "../../types/dictionary/word-definition";

    @Options({
      components: {
      },
    })
    export default class Controls extends Vue {
        @Prop() wordIndex!: number;

        word = '';
        wordSelected = false;
        placing = false;

        previousLookup: DictionaryLookup | null = null;

        currentLookup: DictionaryLookup | null = null;
        hintIndex = 0;

        async mounted() {
            const w = new DictionaryService().getWord(5);
            this.currentLookup = await new DictionaryService().getHint(w);
            this.$emit("initial-word", this.currentLookup);
        }

        async newWord(l: number) {
            let len = 0;
            switch (l) {
                case 1:
                    len = Math.floor(Math.random() * (5 - 4 + 1)) + 4
                    break;
                case 2:
                    len = Math.floor(Math.random() * (7 - 6 + 1)) + 6
                    break;
                case 3:
                    len = Math.floor(Math.random() * (10 - 8 + 1)) + 8
                    break;
            }

            this.previousLookup = JSON.parse(JSON.stringify(this.currentLookup));
            this.word = new DictionaryService().getWord(len, this.previousLookup!.word);
            this.currentLookup = await new DictionaryService().getHint(this.word);
            this.getSimilar();
            this.wordSelected = true;

            this.$emit("new-word", this.currentLookup);

            await nextTick();


        }

        similarIndex:number[] = [];

        getSimilar() {
            if (!this.currentLookup || !this.previousLookup) {
                return;
            }

            this.currentLookup.word.split('').forEach((l, i) => {
                this.previousLookup!.word.includes(l) ? this.similarIndex.push(i) : null;
            })
        }

        async tabNext(evt: InputEvent, index: number) {

            
            await this.setPlayerGuess();

            await nextTick();
            if (this.correct) {
                this.currentLookup!.correct = true;
                this.$emit("new-word", this.currentLookup);
                this.placing = true;
                return;
            }

            if (evt.data?.length === 1) {
                let p = false;
                while (!p) {
                    const el = this.$refs['input' + (index + 1)] as HTMLDivElement[];

                    if (!el[0].attributes.getNamedItem('disabled')) {
                        p = true;
                    }
                    else {
                        index++;
                    }
                }
                (this.$refs['input' + (index + 1)] as HTMLDivElement[])[0].focus();
            }
            else {
                let p = false;
                while (!p) {
                    const el = this.$refs['input' + (index - 1)] as HTMLDivElement[];

                    if (!el[0].attributes.getNamedItem('disabled')) {
                        p = true;
                    }
                    else {
                        index--;
                    }
                }
                (this.$refs['input' + (index - 1)] as HTMLDivElement[])[0].focus();
            }
            

        }

        nextHint() {
            this.hintIndex++;
            if (!this.currentLookup!.meanings[0].definitions[this.hintIndex] || !this.currentLookup!.meanings[0].definitions[this.hintIndex].definition) {
                this.hintIndex = 0;
            }
        }
        get currentHint() {
            if (!this.currentLookup) {
                return "";
            }
            return this.currentLookup!.meanings[0].definitions[this.hintIndex].definition.replace(" " + this.currentLookup.word + " ", " " + this.currentLookup.word.replace(/./g, '*') + " ");
        }

        get previousWord() {
            if (this.previousLookup) {
                return this.previousLookup.word;
            }

            return ''
        }

        playerGuess = '';

        setPlayerGuess() {
            this.playerGuess = ''

            if (!this.currentLookup) {
                return this.playerGuess;
            }

            for (let i = 0; i < this.currentLookup.word.length; i++) {
                this.playerGuess += (this.$refs['input' + i] as HTMLInputElement[])[0].value ?? '';
            }            
        }

        get correct() {
            if (!this.currentLookup) {
                return false;
            }

            return this.playerGuess === this.currentLookup!.word
        }

        @Watch("wordIndex")
        reset(val: number, prev: number) {
            if (val > prev) {
                this.wordSelected = false;
                this.placing = false;
            }
        }
    }
</script>

<style lang="scss">
    .next-hint{
        position:relative;
        left: 0;
    }
    .wordButton {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        border-radius: 50px;
        flex-direction:column;
        min-width: 100px;

        &-e {
            background-color: #e4ff9d;
            border: 1px solid #75ff00;
        }

        &-m {
            background-color: #ffe98f;
            border: 1px solid #70fbbc;
        }

        &-h {
            background-color: #ffe0e0;
            border: 1px solid #6e00ff;
        }
    }

    .word-border {
        border: 3px solid #8a8a8a;
        border-radius: 5px;

        &--correct {
            border-color: #63a70e
        }
    }

    .controls {
        height: 100%;

        .empty-square {
            border-radius: 5px;
            margin: 5px;

            input {
                width: 54px !important;
                height: 54px !important;
                margin: 0;
                padding: 0;
                align-items: center;
                text-align: center;
                font-family: 'Xword';
                text-transform: uppercase;
                font-size: 45px;
            }
        }
    }
</style>