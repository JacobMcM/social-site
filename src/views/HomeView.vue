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
        async pullDataFromSourceProp(source, prop, searchTerm){
            console.log(source + " and " + prop + " and " + searchTerm)

            let data = await (await fetch(`http://localhost:5000/${source}?${prop}=${searchTerm}`)).json()
            if (source === "users"){
                data = data.at(0)
            }
            return data
        },
        toAccount(post){
            const id = post.userId
            this.$router.push(`/profile/${id}`)
        },
        async followAccount(post){

            let postUserName = ''

            if (typeof(post) === "string"){
                postUserName = post //format need for the different way users are rendered compared to posts
            }else{
                postUserName = post.userName
            }

            const postUser = await this.pullDataFromSourceProp("users","userName", postUserName)

            const currUser = await this.pullDataFromSourceProp("users","userName", sessionStorage.getItem('username'))

            let isAlreadyFollowing = false

            console.log(currUser.followingAccounts)

            //check if currUser is already following postUser
            for(let followerIndex in currUser.followingAccounts){
                console.log(currUser.followingAccounts.at(followerIndex))
                if (!isAlreadyFollowing && postUser.userName === currUser.followingAccounts.at(followerIndex)){
                    console.log('we have a match: ' + postUser.userName + " and " + currUser.followingAccounts.at(followerIndex))
                    isAlreadyFollowing = true
                }
            }

            if (!isAlreadyFollowing){
                await currUser.followingAccounts.push(postUserName)

                //patch the currUser followingAccounts                
                fetch(`http://localhost:5000/users/${currUser.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    followingAccounts: currUser.followingAccounts,
                }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    },                
                })
                console.log("patching complete")
                
                //patch the postUser followedByAccounts

                await postUser.followedByAccounts.push(currUser.userName)

                fetch(`http://localhost:5000/users/${postUser.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    followedByAccounts: postUser.followedByAccounts,
                }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8'
                    },                
                })

                console.log("patching complete")
            }else{
                console.log("you are already following them")
            }
            
        }
    },
    async created(){
        this.users = await this.fetchUsers(),
        this.posts = await this.fetchPosts()
    }
}
</script>
