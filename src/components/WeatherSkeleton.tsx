export default function WeatherSkeleton() {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="rounded-2xl bg-white/20 backdrop-blur border border-white/30 p-6 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-white/25 rounded-lg" />
            <div className="h-4 w-20 bg-white/15 rounded-lg" />
            <div className="h-4 w-24 bg-white/15 rounded-lg" />
          </div>
          <div className="w-16 h-16 bg-white/25 rounded-full" />
        </div>
        <div className="mt-4 h-20 w-44 bg-white/25 rounded-xl" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 space-y-2">
              <div className="h-3 w-14 bg-white/20 rounded mx-auto" />
              <div className="h-5 w-10 bg-white/20 rounded mx-auto" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-white/20 backdrop-blur border border-white/30 p-4 animate-pulse">
        <div className="h-3 w-24 bg-white/20 rounded mb-4 mx-1" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between px-2 py-2">
            <div className="h-4 w-8 bg-white/20 rounded" />
            <div className="w-6 h-6 bg-white/20 rounded-full" />
            <div className="flex gap-3">
              <div className="h-4 w-8 bg-white/20 rounded" />
              <div className="h-4 w-8 bg-white/15 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
