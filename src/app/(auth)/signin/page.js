
"use client"

import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"

export default function SignIn() {

    const { data: session } = useSession()

    if (session) {
        // User is authenticated, redirect to the desired page
        window.location.href = "/notebooks"
    }
    
  return <>
<button onClick={() => signIn("google")}>SignIn</button>
  
  </>
}
