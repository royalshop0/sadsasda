import React from "react";
import { Box, Check } from "lucide-react";

const MODELS = [
  { id: "groq-llama-3.3-70b", name: "Llama 3.3 70B", provider: "Groq", speed: 98, quality: 95, active: true },
  { id: "groq-llama-3.1-8b", name: "Llama 3.1 8B", provider: "Groq", speed: 100, quality: 80, active: false },
  { id: "groq-mixtral-8x7b", name: "Mixtral 8x7B", provider: "Groq", speed: 95, quality: 88, active: false },
  { id: "groq-gemma2-9b", name: "Gemma 2 9B", provider: "Groq", speed: 97, quality: 82, active: false },
  { id: "nvidia-llama", name: "Llama 3.1 Nemotron", provider: "NVIDIA", speed: 92, quality: 97, active: false },
  { id: "openrouter-gpt4", name: "GPT-4o", provider: "OpenRouter", speed: 85, quality: 98, active: false },
  { id: "openrouter-claude", name: "Claude 3.5 Sonnet", provider: "OpenRouter", speed: 88, quality: 99, active: false },
  { id: "openrouter-gemini", name: "Gemini 1.5 Pro", provider: "OpenRouter", speed: 90, quality: 97, active: false },
];

const PROVIDERS = ["All", "Groq", "NVIDIA", "OpenRouter"];

export default function Models() {
  const [activeProvider, setActiveProvider] = React.useState("All");
  const [defaultModel, setDefaultModel] = React.useState("groq-llama-3.3-70b");

  const filtered = MODELS.filter((m) => activeProvider === "All" || m.provider === activeProvider);

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold mb-1">Models</h1>
        <p className="text-white/40 text-sm">All benefits of ChatGPT, Claude, Gemini, DeepSeek & more.</p>
      </div>

      {/* Provider tabs */}
      <div className="flex gap-2 mb-6">
        {PROVIDERS.map((p) => (
          <button
            key={p}
            onClick={() => setActiveProvider(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeProvider === p ? "bg-white text-black" : "border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/[0.15]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Model grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((model) => {
          const isDefault = defaultModel === model.id;
          return (
            <div
              key={model.id}
              className={`bg-[#111] border rounded-xl p-5 transition-colors ${
                isDefault ? "border-white/20" : "border-white/[0.07] hover:border-white/[0.12]"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-semibold text-sm">{model.name}</p>
                  <p className="text-white/35 text-xs mt-0.5">{model.provider}</p>
                </div>
                {isDefault && (
                  <span className="flex items-center gap-1 text-[10px] font-bold tracking-wide text-white/60 border border-white/20 px-2 py-0.5 rounded">
                    <Check className="w-3 h-3" /> DEFAULT
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/35">Speed</span>
                    <span className="text-white/60">{model.speed}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400/50 rounded-full" style={{ width: `${model.speed}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/35">Quality</span>
                    <span className="text-white/60">{model.quality}%</span>
                  </div>
                  <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-white/50 rounded-full" style={{ width: `${model.quality}%` }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDefaultModel(model.id)}
                className={`w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  isDefault
                    ? "bg-white/[0.07] text-white cursor-default"
                    : "border border-white/[0.1] text-white/50 hover:text-white hover:border-white/25 hover:bg-white/[0.04]"
                }`}
              >
                {isDefault ? "ACTIVE" : "SET DEFAULT"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
