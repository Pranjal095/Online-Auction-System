import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen container mx-auto px-6 py-24 max-w-5xl">
      <div className="space-y-8">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold">Theme</h2>
          <p className="text-lg text-base-content/80">Choose a theme for the application</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-6">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`
                group flex flex-col items-center gap-3 p-4 rounded-xl transition-all
                ${theme === t ? "bg-base-200 shadow-md ring-2 ring-primary/40" : "hover:bg-base-200/50"}
              `}
              onClick={() => setTheme(t)}
            >
              <div className="relative h-12 w-full rounded-lg overflow-hidden shadow-sm" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-base font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;