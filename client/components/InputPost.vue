<template>
    <form @submit.prevent="post" novalidate>
        <textarea placeholder="What's on your mind" @input="valueChanged" :value=input />
        <div class="buttons">
            <button type="submit"> Post </button>
        </div>
    </form>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';


export default Vue.extend({
    props: {
        onPost: {
            type: Function as PropType<(value: string) => void>,
            default: () => {}
        }
    },
    data(): { value: string } {
        return { value: '' };
    },
    methods: {
        post() {
            this.onPost(this.value);
        },
        valueChanged({ target }: { target: HTMLInputElement }) {
            this.value = target.value;
        }
    }
});
</script>

<style scoped>

form {
    display: flex;
    flex-direction: column;
    height: 100%;
}

textarea { 
    resize: none;
    height: 100%;
}

.buttons {
    text-align: right;
    padding: 5px
}

</style>
