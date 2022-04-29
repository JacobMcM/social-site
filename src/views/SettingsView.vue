<template>
    <v-app>
        <v-text-field
            v-model="message1"
            label="Regular"
            clearable
        ></v-text-field>
        
    </v-app>
</template>

<script>
export default {
    name: 'Profile',
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
    },
    async created(){
        this.users = await this.fetchUsers(),
        this.posts = await this.fetchPosts()
    }
}
</script>