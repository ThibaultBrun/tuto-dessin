<template>
  <div>
    <v-card class="mb-4 pa-3" title="Rechercher un tuto">
      <v-text-field
        v-model="localQuery"
        label="Ex: mario, bob l'éponge..."
        density="compact"
        @keyup.enter="emitSearch"
      />

      <v-btn
        block
        color="deep-purple-accent-4"
        :loading="loading"
        @click="emitSearch"
      >
        Rechercher
      </v-btn>

      <v-alert v-if="error" type="error" class="mt-3">
        {{ error }}
      </v-alert>

      <v-alert
        v-if="results.length === 0 && searchedOnce && !loading && !error"
        type="info"
        class="mt-3"
      >
        Aucun résultat pour cette recherche.
      </v-alert>
    </v-card>

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
            <v-btn
              size="small"
              color="green"
              @click.stop="$emit('add', r)"
            >
              Ajouter
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  query: { type: String, default: "" },
  results: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  searchedOnce: { type: Boolean, default: false },
})

const emit = defineEmits(["update:query", "search", "preview", "add"])

const localQuery = ref(props.query)

watch(
  () => props.query,
  (v) => { if (v !== localQuery.value) localQuery.value = v }
)

watch(localQuery, (v) => emit("update:query", v))

function emitSearch() {
  emit("search")
}
</script>
