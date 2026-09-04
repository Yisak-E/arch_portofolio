"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";




export default function LoginPage() {
        
    const router = useRouter();
    
    const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Handle login logic here
        e.preventDefault(); // Prevent form submission
    
        console.log("Login button clicked");
        router.push("/dashboard"); // Redirect to dashboard after login

         console.log("2. router.push executed");
    }

    const handleGoogleLogin = () => {
        // Handle Google login logic here
        console.log("Google login button clicked");
        router.push("/dashboard"); // Redirect to dashboard after Google login
    }

    const handleFacebookLogin = () => {
        // Handle Facebook login logic here
        console.log("Facebook login button clicked");
        router.push("/dashboard"); // Redirect to dashboard after Facebook login
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 px-10 text-black">
            <h1 className="text-2xl text-black font-bold mb-4">Login Page</h1>
            <p>Welcome back to the Login Page</p>
            

            <div className="mt-4 flex flex-col space-y-2  p-4 w-full flex items-center justify-center font-bold">
                <button onClick={handleGoogleLogin} className=" px-4 py-2 rounded-md w-[400px] shadow-md shadow-gray-400">
                    Google Login
                </button>

                <button onClick={handleFacebookLogin} className=" px-4 py-2 rounded-md w-[400px] shadow-md shadow-gray-400">
                    Facebook Login
                </button>
            </div>

            <div>
                 {/* horizotal line with or in the middle */}
                <div className="flex items-center my-4 ">
                    <div className="flex-grow border-t border-solid border-black border-2"></div>
                    <span className="mx-2 text-gray-500">or</span>
                    <div className="flex-grow border-t border-solid border-black"></div>
                </div>
            </div>
            
            <section>
                <form className="flex flex-col space-y-2 border-solid border-gray-300 border-2 p-4 w-full flex items-center justify-center rounded-md shadow-md shadow-gray-400">
                    <input type="text" placeholder="Username" className="border border-gray-300 rounded-md px-4 py-2 w-[400px]" />
                    <input type="password" placeholder="Password" className="border border-gray-300 rounded-md px-4 py-2 w-[400px]" />
                    <button onClick={handleLogin} className="bg-black text-white px-4 py-2 rounded-md w-[400px]">
                        Login
                    </button>
                </form>
            </section>

                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-blue-500 hover:underline">
                        Register
                    </Link>
                </p>
        </div>
    );
}