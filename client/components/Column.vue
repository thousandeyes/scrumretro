<template>
  <div class="column">
    <h2> {{ column.columnName }} </h2>
    <div class="column-container">
      <div class="post-display"> 
        <div class="column-item" v-for="post in column.posts" :key="post.postId"> 
          <ViewPost :post="post" />
        </div>
        <h3 class="no-posts" v-if="noPosts"> No posts </h3>
      </div>

      <div class="post-input column-item">
        <InputPost :onPost="onPost" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import InputPost from './InputPost.vue';
import Column from '../models/Column';
import ViewPost from './ViewPost.vue';
import Post from '../models/Post';


export default Vue.extend({
  components: { InputPost, ViewPost },
  props: {
    column: { type: Object as PropType<Column> }
  },
  computed: {
    noPosts() {
      return this.column.posts.length === 0;
    },
  },
  methods: {
    onPost(text) {
      // TODO: send post to server
      // TEMP post creation
      const post: Post = {
        postId: `POST: ${this.randomId()}`,
        text: text,
        participant: {
          persistentId: "THIS ID!",
          participantName: "RUUUUIIIII",
        },
        submittedDate: Date.now()/1000
      };
      this.column.posts.push(post);
    },
    randomId() {
      return Math.floor(Math.random() * 100000);
    }
  }
});
</script>


<style scoped>
.column {
  min-height: 200px;
  width:  300px;
  padding: 10px;
}

.column-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: calc(10px / 2);
  border: 1px solid red;
}

.column-item {
  padding: calc(10px / 2) 10px;
}

.post-input {
  height: 100px;
}

.no-posts {
  text-align: center;
}
</style>
