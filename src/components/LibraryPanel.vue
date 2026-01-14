<template>
  <div>
    <v-card class="mb-2" title="Bibliothèque" />

    <v-alert v-if="videos.length === 0" type="info" class="mb-3">
      Bibliothèque vide. Faites une recherche puis “Ajouter”.
    </v-alert>

    <v-list v-else lines="two">
      <v-list-item
        v-for="v in videos"
        :key="v.id"
        @click="$emit('select', v)"
      >
        <template #prepend>
          <v-img
            v-if="v.thumbnail"
            :src="v.thumbnail"
            width="88"
            height="50"
            cover
            class="mr-3"
          />
        </template>

        <v-list-item-title>{{ v.title }}</v-list-item-title>
        <v-list-item-subtitle>
          Ajouté par {{ v.profiles?.pseudo ?? "?" }}
        </v-list-item-subtitle>

        <template #append>
          <v-btn
            v-if="user && v.id_creator === user.id"
            size="small"
            color="red"
            variant="tonal"
            @click.stop="$emit('delete', v)"
          >
            Supprimer
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<script setup>
defineProps({
  videos: { type: Array, default: () => [] },
  user: { type: Object, default: null },
})

defineEmits(["select", "delete"])
</script>
