<template>
    <v-app>
    <v-card
    class="mx-auto"
    max-width="448"
  >
    <v-layout>
      <v-app-bar
        color="primary"
        density="compact"
      >
        <template v-slot:prepend>
          <v-app-bar-nav-icon @click="toHome"></v-app-bar-nav-icon>
        </template>

        

        
        <v-btn icon="mdi-magnify" @click="toSearch"></v-btn>
        <v-btn icon="mdi-account-circle" @click="toMainAccount"></v-btn>



      </v-app-bar>

      <v-main>
        <v-container fluid>
            <router-view/>
        </v-container>
      </v-main>
    </v-layout>
  </v-card>
  </v-app>

</template>



<script>
import SearchViewVue from './views/SearchView.vue'
export default {
    name: 'Profile',
    data() {
        return {
            drawer: false,
            group: null,
            users: [],
            posts: [],
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
        toSearch(){
          this.$router.push('/search');
        },
        toHome(){
          this.$router.push('/home');
        },
        async pullUserFromUsername(username){
          const users = this.fetchUsers();

          users.forEach(user => {
            if (user.userName === username){
              return user
            }
          })
          console.log("user does not exist");
        },
    toMainAccount(){
      const username = sessionStorage.getItem('username');

      console.log(username)

      const currUser = this.pullUserFromUsername(username)

      this.$router.push(`/profile/${currUser.id}`)
    }
  },
  async created(){
    this.users = await this.fetchUsers(),
    this.posts = await this.fetchPosts()
  }
}
</script>

