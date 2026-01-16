<template>
  <div class="searchbar">
    <v-text-field
      v-model="localQuery"
      placeholder="Ex: mario, bob l'éponge..."
      density="compact"
      variant="solo"
      hide-details
      clearable
      prepend-inner-icon="mdi-magnify"
      :loading="loading"
      @keyup.enter="emitSearch"
      @click:prepend-inner="emitSearch"
      @click:clear="emit('update:query', '')"
    />

    <v-btn
      class="ml-2"
      color="white"
      variant="elevated"
      :loading="loading"
      @click="emitSearch"
    >
      Rechercher
    </v-btn>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  query: { type: String, default: "" },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(["update:query", "search"])

const localQuery = ref(props.query)

watch(
  () => props.query,
  (v) => {
    if (v !== localQuery.value) localQuery.value = v
  }
)

watch(localQuery, (v) => emit("update:query", v))

function emitSearch() {
  emit("search")
}
</script>

<style scoped>
.searchbar{
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
