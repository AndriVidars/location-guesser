import StreetView from "@/app/core/maps/streetview";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-24 bg-white dark:bg-black">
        <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">Location Guesser</h1>
        <div className="flex flex-col items-center gap-8">
          <StreetView lat={40.7589} lng={-73.9851} />
          <p className="text-zinc-600 dark:text-zinc-400">
            Times Square, New York
          </p>
        </div>
      </main>
    </div>
  );
}
