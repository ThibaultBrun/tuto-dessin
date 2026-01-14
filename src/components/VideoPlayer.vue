<template>
  <v-card v-if="video" class="pa-4">
    <div class="text-h6 mb-3">{{ video.title }}</div>

    <div style="position:relative; padding-top:56.25%;">
      <iframe
        :src="embedUrl(video.youtube_id)"
        style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  </v-card>

  <v-card v-else class="pa-8 text-center">
    Faites une recherche, ajoutez un tuto, puis sélectionnez-le.
  </v-card>
</template>

<script setup>
const props = defineProps({
  video: { type: Object, default: null },
})

function embedUrl(id) {
  if (!id) return ""
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    loop: "1",
    playlist: id,
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}
</script>
