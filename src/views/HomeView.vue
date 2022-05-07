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
            const res = await fetch('http://localhost:5000/users')
            const data = await res.json()
            return data
        },
        async fetchPosts() {
            const res = await fetch('http://localhost:5000/posts')
            const data = await res.json()
            return data
        },
        async likePost(data) {
            const newlikes = data.numLikes++

            
            fetch(`http://localhost:5000/posts/${data.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    numLikes: newlikes,
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
            })                        
        },
        toAccount(post){
            const id = post.userId
            this.$router.push(`/profile/${id}`)
        },
    },
    async created(){
        this.users = await this.fetchUsers(),
        this.posts = await this.fetchPosts()
    }
}
</script>
