"use client";
import Image from "next/image";
import TypeIt from "typeit-react";
import { useRouter } from "next/navigation";

const AnimatedHeadline = () => {
  return (
    <>
      <h2 className="text-white/95 text-4xl md:text-6xl font-extrabold tracking-tight">
        <TypeIt
          options={{
            strings: [
              '<span class="text-sky-400">这里是你最喜欢的</span> <span class="text-cyan-300">三维编辑器 ✨</span>',
              '<span class="text-fuchsia-400">实时预览</span> · <span class="text-emerald-400">所见即所得</span>',
              '<span class="text-amber-300">一键光照</span> · <span class="text-rose-400">智能材质</span>',
              '<span class="text-cyan-300">升级你的 3D 创作体验</span> 🚀',
            ],
            loop: true,
            speed: 70,
            deleteSpeed: 40,
            lifeLike: true,
            startDelay: 300,
            nextStringDelay: 800,
            cursor: true,
            cursorChar: "▋",
            breakLines: false,
            html: true,
            waitUntilVisible: true,
          }}
        />
      </h2>
    </>
  );
};

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="h-screen flex flex-col">
      <header className="h-16 bg-[#0b1220] border-b border-white/5 flex flex-row items-center px-6 gap-3">
        <Image src="/icon.svg" alt="三维编辑器" width={38} height={38} />
        <h1 className="text-white font-bold">三维编辑器</h1>
      </header>
      <main className="relative flex-1 bg-linear-to-br from-[#0b1220] via-[#0e1a2f] to-[#091322]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_40%,rgba(56,189,248,0.10),transparent_60%)]"></div>
        <div className="relative h-full w-full flex flex-col items-center justify-center gap-8 text-center">
          <AnimatedHeadline />
          <button
            onClick={() => router.push("/editor")}
            className="px-6 py-3 rounded-lg bg-linear-to-b from-sky-500 to-cyan-500 text-white font-medium ring-1 ring-sky-300/30 shadow-lg shadow-cyan-900/30 hover:from-sky-400 hover:to-cyan-400 active:from-sky-600 active:to-cyan-600 transition"
          >
            一键开启你的编辑
          </button>
        </div>
      </main>
      <footer className="h-12 bg-[#0b1220] border-t border-white/5">132</footer>
    </div>
  );
}
