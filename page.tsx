import Link from "next/link";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";



const styles = {
  divContainer: "flex flex-col flex-1 items-center justify-center bg-zinc-500 font-sans dark:bg-black ",
  headerContainer: "flex flex-col items-center justify-center gap-4 boarder-2 border-black  h-16 w-full bg-[#172642] scrollable overflow-x-auto px-4 text-white dark:bg-[#172642] sm:px-6 lg:px-8",
  mainContainer: "flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start",
  h1Text: "max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50",
  codeText: "rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]",
  linkButton: "mt-6 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
}

export default function Home() {
  return (
    <div className={styles.divContainer}>
      <header className={styles.headerContainer}>

        <div>
          <KeyboardArrowDownIcon fontSize="medium" />
        </div>
       
      </header>
      <main className={styles.mainContainer}>
        
       <h1 className={styles.h1Text}>
            To get started, edit the{" "}
            <code className={styles.codeText}>
              page.tsx
            </code>{" "}
            file.
          </h1>

          <Link href="/login" className={styles.linkButton}>
            Login
          </Link>
        
      </main>
    </div>
  );
}
