<template>
    <v-app>
        <v-text-field @input="updateSearch"
            v-model="message1"
            label="Regular"
            
        ></v-text-field>

        <div v-for="user in users" :key="user.id">
            <v-card
                class="mx-auto"
                width="400"
                color="blue"
            >
                <template v-slot:title>
                    <v-avatar color="indigo">
                        <v-icon dark>
                            mdi-account-circle
                        </v-icon>
                    </v-avatar>
                    {{ user.userName }}
                </template>

                <v-card-subtitle>
                    @{{ user.accountId }}
                </v-card-subtitle>
            </v-card>
        </div>

        <div v-for="post in posts" :key="post.id">          
            <v-app id="inspire">
                <v-card
                class="mx-auto"
                color="#26c6da"
                dark
                max-width="400">



                    <v-card-title>                    
                        <span class="text-h4 font-weight-bold">{{ post.postTitle }}</span>
                    </v-card-title>

                    <v-card-subtitle @click="toProfile">
                        <v-avatar color="indigo">
                            <v-icon dark>
                                mdi-account-circle
                            </v-icon>
                        </v-avatar>
                        <span class="text-h5 font-weight-light"> @{{ post.userAccountId }}</span>
                    </v-card-subtitle>
  
                    <v-card-text class="text-h5 font-weight-bold">
                        "{{ post.postContent }}"
                    </v-card-text>
  
                    <v-card-actions>
                        <v-list-item class="grow">
                        
                            <v-icon class="mr-1" @click="like">
                                mdi-account-child-outline
                            </v-icon>
                            <span class="subheading mr-2">256</span>
                            <span class="mr-1">·</span>
                            <v-icon class="mr-1">
                                mdi-share-variant
                            </v-icon>
                            <span class="subheading">45</span>
                        </v-list-item>
                    </v-card-actions>
                </v-card>
            </v-app>
        </div>
        
    </v-app>
</template>

<script>
export default {
    name: 'Profile',
    data() {
        return {
            users: [],
            posts: [],
            message1:'',
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
        async updateSearch() {
            console.log(this.message1)
            this.users = await this.fetchUsers()
            this.posts = await this.fetchPosts()

            this.users = this.users.filter(name => {return name['userName'].indexOf(this.message1) >= 0 || name['accountId'].indexOf(this.message1) >= 0})
            this.posts = this.posts.filter(name => {return name['userAccountId'].indexOf(this.message1) >= 0 || name['postTitle'].indexOf(this.message1) >= 0 || name['postContent'].indexOf(this.message1) >= 0 })           
        }
    },
    async created(){
        this.users = await this.fetchUsers(),
        this.posts = await this.fetchPosts()
    }
}
</script>