import React from 'react'
import { useAuthStore } from '../store/useAuthStore.js'
const ProfilePage = () => {
    const { useAuth } = useAuthStore()

    return (
        <div>ProfilePage</div>
    )
}

export default ProfilePage