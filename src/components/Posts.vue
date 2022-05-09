<template>
    <v-app id="inspire">

        <v-card
        class="mx-auto my-5"
        color="#7a7464"
        theme="dark"
        width="400"
        >
            <v-card-title>
                <span class="text-h5 font-weight-light">{{ postTitle }}</span>
            </v-card-title>

            <v-card-subtitle class="d-flex justify-space-between mb-6">
                <span class="text-h6 font-weight-light" @click="toAccount">{{ userName }}</span>
                <v-btn flat color="#afb8c1" @click="followAccount">Follow</v-btn>
            </v-card-subtitle>

            <v-card-text class="text-h5">
            {{ postContent }}
            </v-card-text>

            <v-card-actions>
                <v-list-item class="grow">                    
                    <v-icon class="mr-1" color="red" @click="likePost" icon="mdi-heart"></v-icon>
                    <span class="subheading mr-2">{{ numLikes }}</span>
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
    }
}
</script>
