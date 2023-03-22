<script lang="ts">
import { addBookGql, meGql, subscriptionBookGql } from './graphql'

export default {
  apollo: {
    allBooks: {
      query: meGql,
      update: (data) => {
        const { me } = data || {}
        const { Books } = me || {}
        return Books || []
      }
    }
  },
  data(): { allBooks: Array<{ id: string; title: string }> } {
    return { allBooks: [] }
  },
  mounted() {
    const observer = this.$apollo.subscribe({
      query: subscriptionBookGql
    })
    const that = this

    observer.subscribe({
      next() {
        that.$apollo.queries.allBooks.refetch()
      },
      error(error) {
        console.error('subscribe:', error)
      }
    })
  },
  methods: {
    onClick() {
      this.addBook()
    },
    addBook() {
      this.$apollo.mutate({
        mutation: addBookGql,
        variables: {
          input: {
            title: `test-${Math.floor(Math.random() * 1000)}`,
            author: `test-author-${Math.floor(Math.random() * 1000)}`
          }
        }
      })
    }
  }
}
</script>
<template>
  <div>
    <button @click="onClick">新增</button>
    <div v-if="$apollo.queries.allBooks.loading">Loading...</div>
    <ul v-else>
      <li v-for="item in allBooks" :key="item.id">{{ item.title }}</li>
    </ul>
  </div>
</template>

<style></style>
