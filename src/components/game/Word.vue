<template>
    <div class="game-board">

    </div>
</template>

<script lang="ts">
    import { Options, Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import GameWord from "../../types/word";

    @Options({
      components: {
      },
    })
    export default class Word extends Vue {
        @Prop() word!: GameWord[];


    }
</script>

<style lang="scss">
    .game-board {
        height: 100%;
        width: 100%;
        background-color: #ffed84
    }
</style>