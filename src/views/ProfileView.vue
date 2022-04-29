<template>
    
    <!--make the tabs "posts, followed accounts, following"-->
    <v-card class="overflow-hidden">
    <v-app-bar
      absolute
      color="#6A76AB"
      dark
      shrink-on-scroll
      prominent
      src="https://picsum.photos/1920/1080?random"
      fade-img-on-scroll
      scroll-target="#scrolling-techniques-3"
    >
      <template v-slot:img="{ props }">
        <v-img
          v-bind="props"
          gradient="to top right, rgba(100,115,201,.7), rgba(25,32,72,.7)"
        ></v-img>
      </template>

      <v-app-bar-title>Title</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>

      <template v-slot:extension>
        <v-tabs align-with-title>
          <v-tab>Tab 1</v-tab>
          <v-tab>Tab 2</v-tab>
          <v-tab>Tab 3</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-sheet
      id="scrolling-techniques-3"
      class="overflow-y-auto"
      max-height="600"
    >
      <v-container style="height: 1000px;"></v-container>
    </v-sheet>
    </v-card>


    <!-- allows me to show something if it meets the "if"
    <div v-if="isCurrProfile">
    -->

    
</template>

<script>
export default {
    name: 'Profile',
    data() {
        return {
            users: [],
            posts: [],
            currUser: [],
        }
    },
    methods: {
        async fetchUsers() {
            const res = await fetch('api/users')
            const data = await res.json()
            return data
        },
        async fetchPosts() {
            const res = await fetch('api/posts')
            const data = await res.json()
            return data
        },
        fetchCurrUser() {
            const data = sessionStorage.getItem('currUser');
            return data
        }
    },
    async created(){
        this.users = await this.fetchUsers(),
        this.posts = await this.fetchPosts(),
        this.currUser = this.fetchCurrUser()
    }
}
</script>
