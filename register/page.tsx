"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";




export default function RegisterPage(){
    const router = useRouter();
    
    const handleRegister = () => {
        // Handle registration logic here
    
        console.log("Register button clicked");
        router.push("/dashboard"); // Redirect to dashboard after registration
    }
    
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <h1>Register Page</h1>
            <p>Welcome to the Register Page</p>
            <p>Please fill in the form to create an account.</p>

            <button
                onClick={handleRegister}
                className="mt-6 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80">
                Register
                </button>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
        </div>
    );
}