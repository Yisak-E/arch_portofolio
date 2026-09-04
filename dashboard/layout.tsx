import Link from "next/link";


export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
   <main className="flex  items-center justify-start bg-zinc-50 font-sans h-screen  ">
    <aside className="flex flex-col justify-center h-full w-80 bg-black text-white">
        <p>Aside content goes here</p>
    </aside>
   
   <section className="h-full  w-[calc(100%-20rem)] bg-black p-10  ">
        {children}
   </section>

  
   </main>
  );
}