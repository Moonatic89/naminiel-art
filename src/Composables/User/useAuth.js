// useAuth.js
import { computed } from "vue"
import { useUserStore } from "@/stores/User/User"

export function useAuth() {
    const userStore = useUserStore()
    const isAuthed = computed(() => !!userStore.uid)
    return { isAuthed }
}
