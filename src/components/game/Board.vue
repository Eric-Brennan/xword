<template>
    <div class="pan-area overflow-hidden h-100"
         id="panArea">
        <div class="game-board"
             ref="gameBoard"
             id="gameBoard">
            <div v-for="(row, y) in grid" :key="'row'+y" class="row">
                <div v-for="(cell, x) in row"
                     :key="'cell'+x"
                     :ref="y+':'+x"
                     class="cell"
                     :style="{'display: none' : cell !== undefined && cell.char !== undefined}"
                     :class="selectedX === x && selectedY === y ? 'cell--selected': cell && cell.state ? 'cell--state-'+cell.state : ''"
                     @click="selectCell(y, x)">
                    <span v-if="cell !== undefined && cell.char !== undefined">{{cell.char.toUpperCase()}}</span>
                </div>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
    import createPanZoom from "panzoom";
    import { Options, Vue } from "vue-class-component";
    import { Prop, Watch } from "vue-property-decorator";
    import DictionaryService from "../../services/dictionary-service";
    import GridCell from "../../types/grid-cell";
    import GameWord from "../../types/word";
    import { DictionaryLookup } from "../../types/dictionary/word-definition";

    @Options({
        components: {
        }
    })
    export default class Board extends Vue {

        @Prop() firstWord!: DictionaryLookup;
        @Prop() currentWord!: DictionaryLookup | null;

        previous: DictionaryLookup[] = [];

        grid = Array.from(Array(51) as GridCell[], () => new Array(51) as GridCell[]);

        selectedX = 0;
        selectedY = 0;

        words: GameWord[] = [];
        definitions: DictionaryLookup[] = [];

        currentLookup: DictionaryLookup | null = null;

        placing = false;

        async mounted() {
            createPanZoom(document.getElementById("gameBoard")!, {
                maxZoom: 3,
                minZoom: 0.5,
                initialY: 1122,
                initialZoom: 1
            })


            this.words.push({ word: this.firstWord.word, positionX: 22, positionY: 26, direction: "H" });
            this.definitions.push(this.firstWord);

            this.addWordToGrid(this.words[0]);

        }

        addWordToGrid(word: GameWord) {
            if (word.direction === "V") {
                for (let i = 0; i < word.word.length; i++) {
                    this.grid[word.positionY + i][word.positionX] = {
                        char: word.word[0 + i],
                        state: 1,
                        word: word.word!,
                        posX: word.positionX,
                        posY: word.positionY + i
                    } as GridCell;
                }
            }
            else {
                for (let i = 0; i < word.word.length; i++) {
                    this.grid[word.positionY][word.positionX + i] = {
                        char: word.word[0 + i],
                        state: 1,
                        word: word.word!,
                        posX: word.positionX + i,
                        posY: word.positionY
                    } as GridCell;
                }

            }
            this.$emit("word-added", word)
        }

        selectCell(y: number, x: number) {
            this.selectedX = x;
            this.selectedY = y;

            if (!this.grid[y][x].word) {
                return;
            }

            if (this.placing) {
                let free = true;
                if (this.grid[y][x].char && this.currentWord!.word.includes(this.grid[y][x].char!)) {

                    const fi = this.grid[y][x].char!;
                    const si = this.currentWord!.word.indexOf(fi);
                    const cind: number[] = [];
                    this.currentWord!.word.split("").forEach((c, i) => c === fi ? cind.push(i) : null);
                    console.log(cind)

                    const word = this.grid[y][x] ? this.grid[y][x].word : ''

                    if (word === '') {
                        return;
                    }

                    const w = this.words.find(d => d.word === word);

                    if (!w) {
                        return;
                    }

                    console.log(w);

                    if (w.direction === "H") {
                        console.log("placing vertical")
                        let free = true;
                        let wi = 0;
                        cind.forEach(ind => {
                            free = true;
                            console.log("si:  ", ind)
                            if (!this.placing) {
                                return;
                            }

                            for (let i = y - ind; i < (y - (ind)) + this.currentWord!.word.length + 1 && free; i++) {
                                if ((this.grid[i][x] && i !== y && this.grid[i][x].char !== this.currentWord!.word.split('')[i - y + ind])) {
                                    console.log(this.currentWord!.word.split('')[i - y + ind])

                                    console.log(this.grid[i][x]);
                                    free = false;

                                }

                                if (((this.grid[i][x + 1] || this.grid[i][x - 1]) && i !== y) && this.grid[i][x].char !== this.currentWord!.word.split('')[i - y + ind]) {
                                    console.log(this.grid[i][x]);
                                    free = false;
                                }

                            }

                            if (free) {
                                const gw = {
                                    word: this.currentWord!.word,
                                    positionX: x,
                                    positionY: y - ind,
                                    direction: "V"
                                } as GameWord
                                console.log(gw)
                                this.words.push(gw);
                                this.addWordToGrid(gw);
                                this.placing = false;
                                return;
                            }
                        })
                        
                    }
                    else {
                        console.log("placing horizontal")

                        let free = true;
                        let wi = 0;
                        for (let i = (x - (si)); i < (x - (si)) + this.currentWord!.word.length + 1 && free; i++) {
                            if ((this.grid[y][i] && i !== x && this.grid[y][i].char !== this.currentWord!.word.split('')[x - i - 1])) {
                                console.log(this.currentWord!.word.split('')[x - i - 1])

                                console.log(this.grid[y-1][i]);
                                console.log(this.grid[y][i]);
                                console.log(this.grid[y+1][i]);
                                free = false;
                                
                            }

                            if (((this.grid[y + 1][i] || this.grid[y - 1][i]) && i !== x) && this.grid[y][i].char !== this.currentWord!.word.split('')[x - i - 1]) {
                                console.log(this.grid[y - 1][i]);
                                console.log(this.grid[y][i]);
                                console.log(this.grid[y + 1][i]);
                                free = false;
                            }
                            
                        }

                        if (free) {
                            const gw = {
                                word: this.currentWord!.word,
                                positionX: x -si,
                                positionY: y,
                                direction: "H"
                            } as GameWord
                            console.log(gw)
                            this.words.push(gw);
                            this.addWordToGrid(gw);
                            this.placing = false;
                        }
                        
                    }
                    //place vertical
                    //if (this.grid[y][x + 1] || this.grid[y][x - 1]) {
                    //    console.log("place vertical")


                    //    const gw = {
                    //        word: this.currentWord!.word,
                    //        positionX: x,
                    //        positionY: y - si,
                    //        direction: "V"
                    //    } as GameWord
                    //    console.log(gw)
                    //    this.words.push(gw);
                    //    this.addWordToGrid(gw);
                    //}
                    //else {
                    //    console.log("place horz")
                    //    console.log(si)
                    //    for (let i = x - si; i < x + this.currentWord!.word.length; i++) {
                    //        if (((this.grid[y][i] && !this.currentWord!.word.includes(this.grid[y][i].char!)) && i !== x) ) {
                    //            console.log(this.grid[y - 1][i])
                    //            console.log(this.grid[y + 1][i])
                    //            return;
                    //        }
                    //    }

                    //    const gw = {
                    //        word: this.currentWord!.word,
                    //        positionX: x-si,
                    //        positionY: y,
                    //        direction: "H"
                    //    } as GameWord
                    //    console.log(gw)
                    //    this.words.push(gw);
                    //    this.addWordToGrid(gw);
                    //}
                }
            }
        }

        @Watch("currentWord", { deep: true })
        setNew(val: DictionaryLookup | null, prev: DictionaryLookup | null) {
            const prevWord = this.definitions[this.definitions.length - 1].word;
            if ((val && !prev) || (val && prev && val.word !== prev!.word)) {
                this.definitions.push(val);

                this.grid.forEach((y, yi) => {
                    y.forEach((r, xi) => {
                        (this.$refs[yi + ":" + xi] as HTMLDivElement[])[0].classList.remove('cell--state-1' + 'cell--state-2' + 'cell--state-3' + 'cell--state-4');
                        //@ts-ignore
                        if (r.char && r.word && r.word === prevWord) {
                            if (val.word.indexOf(r.char) > -1) {
                                r.state === 2;
                                
                                (this.$refs[yi + ":" + xi] as HTMLDivElement[])[0].classList.add('cell--state-2');
                            }
                        }
                    })
                })
            }
            if (val && val.correct) {
                this.placing = true;
            }
        }
    }
</script>

<style lang="scss">
    .pan-area{
        border: 1px solid black;
    }
    .game-board {
        width: 100%;
        height: 100%;
        background-color: #ffed84;

        .row {
            display: flex;
            width: fit-content;
        }

        .cell {
            height: 20px;
            width: 20px;
            border: 1px solid #8a8a8a12;
            background-color: #ffed84;
            display: flex;
            align-items: center;
            justify-content: center;

            &--state {

                &-1 {
                    border: 1px solid #5cca00;
                    background-color: #e7ffae;
                    cursor: pointer;
                }

                &-2 {
                    border: 1px solid #00ffff;
                    background-color: #00ff21;
                    cursor: pointer;
                }
            }

            &--active {
                border: 1px solid #8a8a8a12;
                background-color: #ffed84;
                cursor: pointer;
            }

            &--selected {
                border: 1px solid #0079ff;
                background-color: #ffffff;
                cursor: pointer;
            }
        }
    }
</style>