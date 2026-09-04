import Footer from "@/component/Footer";
import Image from "next/image";


export default function LoginLayout({ children }: LayoutProps<"/">) {
  return (
   <main className="lg:grid lg:grid-cols-2 lg:h-screen lg:w-screen bg-[#452B4F] font-sans dark:bg-[#452B4F] flex flex-col md:h-full ">
     <section className="bg-[#452B4F] lg:grid lg:col-span-1 sm:pb-8">
      <h1 className="text-4xl text-white font-bold text-center mt-8">Brand Name</h1>
      <p className="text-white text-center text-2xl font-sans italic mt-4">Brand adverticement goes here.</p>
      <div className=" h-[500px] flex items-center justify-center p-4 text-white  my-8 mx-10 hidden lg:flex">

        <Image src="/moon1.png" className="object-contain " alt="Brand Image" width={300} height={500} />

      </div>
     </section>

     <section className="bg-gray-50 md:col-span-2 sm:mx-15 sm:rounded-lg  lg:col-span-1 flex flex-col items-center  lg:mx-0 lg:rounded-none lg:justify-center lg:items-center">
        {children}
     </section>
     <section className="bg-[#452B4F] lg:grid lg:col-span-1 lg:hidden lg:flex">
      <Footer/>
     </section>
   </main>
  );
}

