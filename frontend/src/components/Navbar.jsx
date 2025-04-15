import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
function Navbar() {
    const { useAuth } = useAuthStore()

    return (
        <div>Navbar</div>
    )
}

export default Navbar