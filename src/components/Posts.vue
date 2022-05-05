<template>
    <v-app id="inspire">

        <v-card
        class="mx-auto my-5"
        color="purple"
        theme="dark"
        width="400"
        >
            <v-card-title>
                <span class="text-h6 font-weight-light">{{ postTitle }}</span>
            </v-card-title>

            <v-card-subtitle>
                <v-avatar color="indigo" @click="toAccount"> 
                    <v-icon dark>
                        mdi-account-circle
                    </v-icon>
                </v-avatar>
                <span class="text-h7 font-weight-light" @click="toAccount">{{ userName }}</span>
                <v-btn flat color="secondary" @click="followAccount">Follow</v-btn>
            </v-card-subtitle>

            <v-card-text class="text-h5">
            {{ postContent }}
            </v-card-text>

            <v-card-actions>
                <v-list-item class="grow">                    
                    <v-icon class="mr-1" color="red" @click="likePost" icon="mdi-heart"></v-icon>
                    <span class="subheading mr-2">{{ numLikes }}</span>
                    <span class="mr-1">·</span>
                    <v-icon class="mr-1" color="primary" @click="addComment" icon="mdi-comment"></v-icon>
                    <span class="subheading">{{ numComments }}</span>
                </v-list-item>
            </v-card-actions>
  
  
        </v-card>
    </v-app>      
</template>

<script>
export default {
    name: 'Post',
    props: {
        postTitle: String,
        userName: String,
        postContent: String,
        numLikes: Number,
        numComments: Number,
    },
    methods: {
        toAccount() {
            this.$emit('toAccount')
        },
        followAccount(){
            this.$emit('followAccount')
        },
        likePost() {
            this.$emit('likePost')
        },
        addComment(){
            this.$emit('addComment')
        }
    }
}
</script>
