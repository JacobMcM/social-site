<template>
    <div v-for="post in posts" :key="post.id">
          
        <v-app id="inspire">
            <v-card
            class="mx-auto"
            color="#26c6da"
            dark
            max-width="400">

                <v-card-title @click="toProfile">
                    <!--<v-row justify="space-between">-->                
                        <v-avatar color="indigo">
                            <v-icon dark @click="toProfile">
                                mdi-account-circle
                            </v-icon>
                        </v-avatar>
                        <span class="mr-1"></span>
                        <span class="text-h6 font-weight-light" @click="toProfile"> @{{ post.userAccountId }}</span>
                        <span class="mr-1"></span>
                        <v-btn flat color="secondary" @click="followAccount">Follow</v-btn>
                    <!--</v-row>-->
               </v-card-title>

                <v-card-title>                    
                    <span class="text-h6 font-weight-bold">{{ post.postTitle }}</span>
               </v-card-title>
  
                <v-card-text class="text-h5 font-weight-bold">
                    "{{ post.postContent }}"
                </v-card-text>
  
                <v-card-actions>
                    <v-list-item class="grow">
                        
                        <v-btn icon="mdi-heart" color="red" @click="likePost(post)"></v-btn>
                        
                        <span class="subheading mr-2">{{ post.numLikes }}</span>
                        <span class="mr-1">·</span>

                        <v-btn icon="mdi-comment" color="primary" @click="addComment(post)"></v-btn>
                        
                        <span class="subheading">{{ post.numComments }}</span>
                    </v-list-item>

                </v-card-actions>
            </v-card>
        </v-app>
    </div>
</template>

<script>
export default {
    name: 'Home',
    data() {
        return {
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
        async likePost(data) {
            const newlikes = data.numLikes++

            
            fetch(`api/posts/${data.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    numLikes: newlikes,
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
            })                        
        }
    },
    async created(){
        this.users = await this.fetchUsers(),
        this.posts = await this.fetchPosts()
    }
}
</script>
