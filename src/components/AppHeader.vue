<template>
  <v-app-bar color="deep-purple-accent-4" height="96">
    <v-container fluid class="px-4">
      <div class="appbar">
        <!-- LOGO 1 -->
        <v-img :src="logo1" class="logo-left" contain />

        <!-- RECHERCHE -->
        <div class="search-zone">
          <SearchBar
            v-model:query="queryProxy"
            :loading="searchLoading"
            @search="emit('doSearch')"
          />
        </div>

        <!-- LOGO 2 -->
        <v-img :src="logo2" class="logo-middle" contain />

        <!-- AUTH -->
        <div class="auth-zone">
          <div
            v-if="profile?.pseudo"
            class="mr-3 text-body-1 font-weight-medium text-white"
          >
            {{ profile.pseudo }}
          </div>

          <v-btn
            v-if="!user"
            variant="tonal"
            color="white"
            @click="emit('openAuth')"
          >
            Connexion
          </v-btn>

          <v-btn v-else variant="tonal" color="white" @click="emit('logout')">
            Déconnexion
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { computed } from "vue";
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";
import SearchBar from "./SearchBar.vue";

const props = defineProps({
  user: Object,
  profile: Object,

  searchQuery: { type: String, default: "" },
  searchLoading: { type: Boolean, default: false },
  searchError: { type: String, default: "" },
  searchedOnce: { type: Boolean, default: false },
  resultsCount: { type: Number, default: 0 },
});

const emit = defineEmits([
  "openAuth",
  "logout",
  "doSearch",
  "update:searchQuery",
]);

const queryProxy = computed({
  get: () => props.searchQuery,
  set: (v) => emit("update:searchQuery", v),
});
</script>

<style scoped>
.appbar {
  display: flex;
  align-items: center;
  height: 96px;
  gap: 16px;
  flex-wrap: nowrap;
}

.logo-left {
  width: 180px;
  height: 60px;
  flex: 0 0 auto;
}

.search-zone {
  flex: 1 1 auto;
  max-width: 420px;
  min-width: 260px;
}

.logo-middle {
  width: 200px;
  height: 70px;
  flex: 0 0 auto;
}

.auth-zone {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  white-space: nowrap;
}
</style>
