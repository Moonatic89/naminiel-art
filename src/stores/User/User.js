import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    // salviamo solo info sicure dell'utente Auth
    const user = useStorage('user', null, localStorage, {
        serializer: {
            read: (v) => v ? JSON.parse(v) : null,
            write: (v) => JSON.stringify(v)
        }
    })

    const uid = computed(() => user.value?.uid ?? null)
    const email = computed(() => user.value?.email ?? null)

    function setUser(data) {
        // data atteso: { uid, email, displayName?, claims? }
        user.value = data
    }

    function clearUser() {
        user.value = null
    }

    return {
        user,
        uid,
        email,
        setUser,
        clearUser
    }
})
