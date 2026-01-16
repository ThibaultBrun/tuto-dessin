<template>
  <v-app>
    <AppHeader
      :user="user"
      :profile="profile"
      :searchQuery="searchQuery"
      :searchLoading="searchLoading"
      :searchError="searchError"
      :searchedOnce="searchedOnce"
      :resultsCount="searchResults.length"
      @update:searchQuery="searchQuery = $event"
      @doSearch="doSearch"
      @openAuth="authDialog = true"
      @logout="logout"
    />
    <v-main>
      <v-container fluid class="py-6">
        <v-row>
          <!-- Résultats : UNIQUEMENT quand showResults = true -->
          <v-col v-if="showResults" cols="12" md="3">
            <SearchResultsPanel
              :results="searchResults"
              @preview="previewResult"
              @add="(r) => requireAuth(() => addVideo(r))"
            />
          </v-col>

          <!-- Player : grand si pas de résultats -->
          <v-col cols="12" :md="showResults ? 6 : 9">
            <VideoPlayer :video="current" />
          </v-col>

          <!-- Bibliothèque : toujours à droite -->
          <v-col cols="12" md="3">
            <LibraryPanel
              :videos="videos"
              :user="user"
              @select="
                (v) => {
                  current = v;
                  showResults = false;
                }
              "
              @delete="(v) => deleteVideo(v)"
            />
          </v-col>
        </v-row>
      </v-container>

      <!-- Dialog Auth -->
      <v-dialog v-model="authDialog" max-width="520">
        <v-card>
          <v-card-title>Connexion</v-card-title>

          <v-card-text>
            <v-tabs v-model="authTab" grow>
              <v-tab value="login">Connexion</v-tab>
              <v-tab value="signup">Créer un compte</v-tab>
            </v-tabs>

            <v-window v-model="authTab" class="mt-4">
              <v-window-item value="login">
                <v-text-field v-model="email" label="Email" type="email" />
                <v-text-field
                  v-model="password"
                  label="Mot de passe"
                  type="password"
                />
                <v-alert v-if="authError" type="error" class="mt-3">{{
                  authError
                }}</v-alert>
              </v-window-item>

              <v-window-item value="signup">
                <v-text-field v-model="email" label="Email" type="email" />
                <v-text-field
                  v-model="password"
                  label="Mot de passe"
                  type="password"
                />
                <v-alert v-if="authInfo" type="info" class="mt-3">{{
                  authInfo
                }}</v-alert>
                <v-alert v-if="authError" type="error" class="mt-3">{{
                  authError
                }}</v-alert>
              </v-window-item>
            </v-window>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="authDialog = false">Fermer</v-btn>
            <v-btn
              color="deep-purple-accent-4"
              @click="authTab === 'login' ? login() : signup()"
            >
              {{ authTab === "login" ? "Connexion" : "Créer" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { supabase } from "./lib/supabase";
import SearchResultsPanel from "./components/SearchResultsPanel.vue";
import VideoPlayer from "./components/VideoPlayer.vue";
import LibraryPanel from "./components/LibraryPanel.vue";
import AppHeader from "./components/AppHeader.vue";

import logoUrl from "./assets/logo.png";
import logo1 from "./assets/logo1.png";
import logo2 from "./assets/logo2.png";

const showResults = ref(false);
const lastExecutedQuery = ref("");

// optionnel : si tu veux fermer les résultats quand query est vide
const hasQuery = computed(() => (searchQuery || "").trim().length > 0);

const user = ref(null);
const profile = ref(null);

const authDialog = ref(false);
const authTab = ref("login");
const email = ref("");
const password = ref("");
const authError = ref("");
const authInfo = ref("");

const videos = ref([]);
const current = ref(null);

const searchQuery = ref("");
const searchResults = ref([]);
const searchLoading = ref(false);
const searchError = ref("");
const searchedOnce = ref(false);

onMounted(async () => {
  const {
    data: { user: u },
  } = await supabase.auth.getUser();
  user.value = u ?? null;

  if (user.value) await loadProfile();

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null;
    if (user.value) {
      await loadProfile();
    } else {
      profile.value = null;
    }
  });

  await loadVideos();
});
async function loadProfile() {
  const { data, error } = await supabase
    .from("profiles")
    .select("pseudo")
    .eq("id", user.value.id)
    .maybeSingle();

  if (error) {
    console.error("Erreur chargement profil:", error);
    profile.value = null;
    return;
  }

  profile.value = data ?? null;
}

function youtubeEmbedUrl(id) {
  const params = new URLSearchParams({
    rel: "0", // limite les suggestions (mais pas 0 absolu)
    modestbranding: "1", // branding minimal
    iv_load_policy: "3", // supprime les annotations (ancien)
    fs: "1",
    controls: "1",
    disablekb: "1", // optionnel: désactive clavier (enfant)
    playsinline: "1",
  });

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

async function loadVideos() {
  const { data, error } = await supabase
    .from("video")
    .select("id,title,youtube_id,thumbnail,tags,id_creator,profiles(pseudo)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    videos.value = [];
    return;
  }

  videos.value = data ?? [];
  if (!current.value && videos.value.length) current.value = videos.value[0];
}

async function doSearch() {
  const q = (searchQuery.value ?? "").trim();
  if (!q) return;

  // normalisation : "  Bob   l'éponge " == "bob l'éponge"
  const normalized = q.toLowerCase().replace(/\s+/g, " ");

  // ✅ même requête => on n'appelle pas l'edge function, on ouvre juste le panneau
  if (normalized === lastExecutedQuery.value) {
    showResults.value = true;
    return;
  }

  // nouvelle requête => on mémorise + on lance la recherche
  lastExecutedQuery.value = normalized;

  showResults.value = true;

  searchError.value = "";
  searchResults.value = [];
  searchedOnce.value = true;
  searchLoading.value = true;

  const { data, error } = await supabase.functions.invoke("youtube-search", {
    body: { q },
  });

  searchLoading.value = false;

  if (error) {
    console.error(error);
    searchError.value = "Erreur Edge Function (voir console/logs Supabase).";
    return;
  }

  if (!data?.ok) {
    searchError.value = data?.error || "Erreur API YouTube.";
    return;
  }

  searchResults.value = data.results ?? [];
}

function previewResult(r) {
  showResults.value = false;

  // preview immédiat dans le lecteur sans l’ajouter
  current.value = {
    id: "preview",
    title: r.title,
    youtube_id: r.youtube_id,
    thumbnail: r.thumbnail,
  };
}

async function addVideo(r) {
  const { data: auth } = await supabase.auth.getUser();
  const u = auth.user;
  if (!u) return;

  const { error } = await supabase.from("video").insert({
    youtube_id: r.youtube_id,
    title: r.title,
    description: "",
    thumbnail: r.thumbnail,
    tags: [],
    id_creator: u.id,
  });

  if (error) {
    console.error(error);
    alert("Erreur insertion (voir console).");
    return;
  }

  await loadVideos();
  alert("Ajouté à la bibliothèque.");
}

async function login() {
  authError.value = "";
  authInfo.value = "";
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  if (error) {
    authError.value = error.message;
    return;
  }

  const u = data?.user;

  authInfo.value =
    "Compte créé. Vérifiez vos emails si la confirmation est activée.";
}

async function signup() {
  authError.value = "";
  authInfo.value = "";

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: { emailRedirectTo: window.location.origin },
  });

  if (error) {
    authError.value = error.message;
    return;
  }

  authInfo.value =
    "Compte créé. Vérifiez vos emails si la confirmation est activée.";
}

async function logout() {
  await supabase.auth.signOut();
}

function requireAuth(fn) {
  if (!user.value) {
    authTab.value = "login";
    authDialog.value = true;
    return;
  }
  fn();
}

async function deleteVideo(v) {
  if (!confirm("Supprimer cette vidéo de la bibliothèque ?")) return;

  const { error } = await supabase.from("video").delete().eq("id", v.id);

  if (error) {
    console.error(error);
    alert("Suppression impossible (droits ?)");
    return;
  }

  // mise à jour UI
  videos.value = videos.value.filter((x) => x.id !== v.id);
  if (current.value?.id === v.id) current.value = videos.value[0] ?? null;
}
</script>
