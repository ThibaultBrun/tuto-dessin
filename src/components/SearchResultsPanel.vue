<template>
  <v-card v-if="results.length" class="mb-4" title="Résultats">
    <v-list lines="two">
      <v-list-item
        v-for="r in results"
        :key="r.youtube_id"
        @click="$emit('preview', r)"
      >
        <template #prepend>
          <v-img :src="r.thumbnail" width="88" height="50" cover class="mr-3" />
        </template>

        <v-list-item-title>{{ r.title }}</v-list-item-title>
        <v-list-item-subtitle>{{ r.channel }}</v-list-item-subtitle>

        <template #append>
          <v-btn size="small" color="green" @click.stop="$emit('add', r)">
            Ajouter
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
defineProps({
  results: { type: Array, default: () => [] },
})

defineEmits(["preview", "add"])
</script>
