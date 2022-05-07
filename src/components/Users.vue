<template>
    <v-app id="inspire">
        <v-card
        width="400"
        >
            <template v-slot:title class="mx-1">
                <v-avatar color="indigo" @click="toAccount">
                    <v-icon dark>
                        mdi-account-circle
                    </v-icon>
                </v-avatar>
                <span class="text-h7 font-weight-light" @click="toAccount">{{ userName }}</span>
                <v-btn flat color="secondary" @click="followAccount">Follow</v-btn>
            </template>
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
