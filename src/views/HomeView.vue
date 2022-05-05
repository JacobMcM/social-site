<template>
    <div v-for="post in posts" :key="post.id">

        <Posts @toAccount="toAccount(post)" @followAccount="followAccount(post)" @likePost="likePost(post)" @addComment="addComment(post)" :postTitle="post.postTitle" :userName="post.userName" :postContent="post.postContent" :numLikes="post.numLikes" :numComments="post.numComments"/>
            
    </div>
</template>

<script>
import Posts from '@/components/Posts'

export default {
    name: 'Home',
    data() {
        return {
            users: [],
            posts: [],
        }
    },
    components: {
        Posts
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
