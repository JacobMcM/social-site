<template>
    <v-app id="inspire">
        <v-card
        width="400"
        color="#a5844e"
        theme="dark"
        >
            <v-card-title class="d-flex justify-space-between mb-6">
                        <span @click="toAccount">{{ userName }} </span>
                        <!--<span class="text-h7 font-weight-light" @click="toAccount">{{ userName }}</span>-->
                        <v-btn flat color="#afb8c1" @click="followAccount">Follow</v-btn>
            </v-card-title>
        </v-card>
    </v-app>
</template>

<script>
export default {
    name: 'User',
    props: {
        userName: String,
        
    },
    methods: {
        toAccount() {
            this.$emit('toAccount')
        },
        followAccount(){
            this.$emit('followAccount')
        }
    }
}
</script>
