"use client";

import { motion } from "framer-motion";

// Usa motion.img diretamente — sem wrapper div
const M = motion.img;

export function HeroIllustration() {
  return (
    <div className="relative flex h-56 w-full max-w-1/2 items-end justify-center sm:h-64">
      <div
        className="
          absolute
          inset-0
          w-[70%]
          h-[120%]
          -top-5
          left-[55%]
          -translate-x-1/2
          bg-[#EEF5FF]
          rounded-[42%_58%_70%_30%/45%_35%_65%_55%]
          z-0
        "
      />

      {/* Decorações */}
      <div className="absolute top-8 left-12 w-3 h-3 rotate-45 bg-blue-200/60 z-0" />
      <div className="absolute top-14 right-24 w-2 h-2 rounded-full bg-blue-200/60 z-0" />
      <div className="absolute bottom-16 right-12 w-4 h-4 rotate-45 bg-blue-200/50 z-0" />
      <div className="absolute top-24 left-1/2 w-2 h-2 rounded-full bg-blue-200/50 z-0" />
      <div className="absolute top-32 right-12 w-2 h-2 rounded-full bg-blue-300/40 z-0" />
      <div className="absolute top-[60%] left-1/2 -translate-1/2">
        <div className="absolute w-full h-px top-[55%]">

          {/* Troféu: cima → baixo */}
          <M
            className="absolute -top-44 right-9 z-20"
            src="/animacao/trophy.png"
            alt="Troféu"
            width={450}
            height={100}
            initial={{ opacity: 0, translateY: -60 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 0.5, duration: 0.55, ease: "easeOut" }}
          />

          {/* Bola: esquerda → direita */}
          <M
            className="absolute -top-5 right-[33%] z-7"
            src="/animacao/ball.png"
            alt="Bola"
            width={110}
            height={100}
            initial={{ opacity: 0, translateX: -60 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 0.7, duration: 0.55, ease: "easeOut" }}
          />

        </div>

        {/* Livros: baixo → cima */}
        <M
          className="relative z-10"
          src="/animacao/books.png"
          alt="Livros"
          width={500}
          height={10}
          initial={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 0, duration: 0.6, ease: "easeOut" }}
        />

        {/* Chapéu: cima → baixo */}
        <M
          className="absolute -top-18 right-16 -rotate-8 z-20"
          src="/animacao/cap.png"
          alt="Capelo"
          width={400}
          height={100}
          initial={{ opacity: 0, translateY: -60 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 0.5, duration: 0.55, ease: "easeOut" }}
        />

        {/* Folha esquerda: direita → esquerda */}
        <M
          className="absolute bottom-8 z-0"
          src="/animacao/leaves_left.png"
          alt="Folhas esquerda"
          width={200}
          height={150}
          initial={{ opacity: 0, translateX: 60 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: 0.9, duration: 0.55, ease: "easeOut" }}
        />

        {/* Folha direita: esquerda → direita */}
        <M
          className="absolute bottom-10 z-0 -right-10"
          src="/animacao/leaves_right.png"
          alt="Folhas direita"
          width={200}
          height={150}
          initial={{ opacity: 0, translateX: -60 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: 0.9, duration: 0.55, ease: "easeOut" }}
        />

        {/* Papel: baixo → cima com rotação */}
        <M
          className="absolute -top-6 -right-17 z-5"
          src="/animacao/sheet.png"
          alt="Papel"
          width={500}
          height={100}
          initial={{ opacity: 0, translateY: 60, rotate: -10 }}
          animate={{ opacity: 1, translateY: 0, rotate: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
        />

      </div>
    </div>
  );
}