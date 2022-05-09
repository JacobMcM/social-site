<template>
    <v-app>
    <v-card
    class="mx-auto"
    max-width="448"
  >

    <!--this drawer is called when the profile button is presson the navBar-->
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        position="right"
        temporary

      >
        <v-list-item
          prepend-icon="mdi-home"
          title="Home"
          @click="toHome"
        ></v-list-item>

        <v-divider></v-divider>

        <v-list-item
          prepend-icon="mdi-magnify"
          title="Search"
          @click="toSearch"
        ></v-list-item>

        <v-divider></v-divider>

        <v-list-item
          prepend-icon="mdi-account-circle"
          title="Your Account"
          @click="toMainAccount"
        ></v-list-item>

        <v-divider></v-divider>

        <v-list-item
          prepend-icon="mdi-exit-run"
          title="Sign Out"
          @click="signOut"
        ></v-list-item>
      </v-navigation-drawer>

      <v-app-bar
        color="#b24f14"
        density="compact"
      >
        <template v-slot:prepend >
          <v-img @click="toHome"
          src="./assets/ROBIN.png"
          aspect-ratio="1"
          width="25"
          ></v-img>

          <span class="text-white" @click="toHome">Robin&trade;</span>
 
        </template>

        

        <v-btn icon="mdi-magnify" color="white" @click="toSearch"></v-btn>
        <v-btn icon="mdi-account-circle" color="white" @click.stop="drawer = !drawer"></v-btn>

 
      </v-app-bar>
    
      <v-main padding>
        
        <v-container fluid background-color="black">
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

          //tracks if the drawer should be rendered
            drawer: false,

            group: null,

            //a local copy of users from db.json
            users: [],
            //a local copy of posts from db.json
            posts: [],
        }
    },
    methods: {
        //return Users from db.json
        async fetchUsers() {
            const res = await fetch('http://localhost:5000/users')
            const data = await res.json()
            return data
        },
        //return Posts from db.json
        async fetchPosts() {
            const res = await fetch('http://localhost:5000/posts')
            const data = await res.json()
            return data
        },

        //send to search page
        toSearch(){
          this.$router.push('/search');
        },

        //send to home page
        toHome(){
          this.$router.push('/home');
        },

        //when fed a username, this will return the full user associated with it
        async pullUserFromUsername(username){          
          const userNameArr = await (await fetch(`http://localhost:5000/users?userName=${username}`)).json()
          const currUser = userNameArr.at(0)
          return currUser
        },

        //send to the account page of the main user
        async toMainAccount(){
          const username = sessionStorage.getItem('username');

          const currUser = await this.pullUserFromUsername(username)

          await this.$router.push(`/profile/${currUser.id}`)
          this.$router.go()
          //await this.$router.push('/profile')//<-trying to isolate issue
        },

        //logs out the curruser by removing the sessionstorage data
        signOut(){
          sessionStorage.setItem("username", "")
          this.$router.push('/login')
        }
  },
  async created(){
    this.users = await this.fetchUsers(),
    this.posts = await this.fetchPosts()
  }
}
</script>

