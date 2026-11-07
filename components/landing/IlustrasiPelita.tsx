"use client";

import { MascotPijar } from "@/components/anak/MascotPijar";

/**
 * Ilustrasi Pulau Melayang Hero (nuansa Cerah Keemasan sesuai color-palette-api-merah-keemasan.md)
 */
export function IlustrasiPulauHero() {
  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border-2 border-[#EDB664]/60 bg-gradient-to-b from-[#FFF6E5] via-[#FBD9B5] to-[#F8C99A] shadow-[0_24px_60px_-15px_rgba(142,31,46,0.18)] aspect-[4/3.6]">
      <svg
        viewBox="0 0 640 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover"
      >
        <defs>
          <linearGradient id="skyGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="38%" stopColor="#FBD9B5" />
            <stop offset="72%" stopColor="#F8C99A" />
            <stop offset="100%" stopColor="#F3A08F" />
          </linearGradient>
          <radialGradient id="sunBurst" cx="65%" cy="32%" r="48%">
            <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#EDB664" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F4813A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="seaShimmer" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8C99A" />
            <stop offset="50%" stopColor="#EDB664" />
            <stop offset="100%" stopColor="#E4545A" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="islandRock" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D93A45" />
            <stop offset="45%" stopColor="#A82535" />
            <stop offset="100%" stopColor="#7F1D2B" />
          </linearGradient>
          <linearGradient id="meadowGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCE2B6" />
            <stop offset="50%" stopColor="#EDB664" />
            <stop offset="100%" stopColor="#F4813A" />
          </linearGradient>
          <linearGradient id="canopyWarm" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EDB664" />
            <stop offset="60%" stopColor="#F4813A" />
            <stop offset="100%" stopColor="#D93A45" />
          </linearGradient>
          <linearGradient id="canopyCrimson" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E4545A" />
            <stop offset="65%" stopColor="#A82535" />
            <stop offset="100%" stopColor="#7F1D2B" />
          </linearGradient>
        </defs>

        {/* Langit keemasan cerah */}
        <rect width="640" height="560" fill="url(#skyGold)" />

        {/* Cahaya matahari hangat */}
        <circle cx="420" cy="185" r="230" fill="url(#sunBurst)" />
        <circle cx="420" cy="185" r="68" fill="#FFFBF2" opacity="0.85" />

        {/* Awan berlapis krem keemasan */}
        <g opacity="0.92">
          <path
            d="M-20 260C20 230 75 235 105 258C135 220 205 218 240 255C275 235 330 245 350 275H-20V260Z"
            fill="#FFFBF4"
          />
          <path
            d="M310 245C345 210 415 212 450 248C485 215 555 218 590 252C615 240 645 248 660 270H310V245Z"
            fill="#FFF7E8"
          />
          <path
            d="M40 310C95 278 165 282 210 312C260 278 355 276 410 310C465 285 545 290 600 320H40V310Z"
            fill="#FBD9B5"
            opacity="0.7"
          />
        </g>

        {/* Lautan cahaya keemasan di bagian bawah */}
        <rect x="0" y="405" width="640" height="155" fill="url(#seaShimmer)" />
        {/* Kilau gelombang keemasan */}
        <g stroke="#FFFBF4" strokeWidth="2.5" strokeLinecap="round" opacity="0.75">
          <path d="M70 438H165" />
          <path d="M440 432H550" />
          <path d="M130 468H250" />
          <path d="M390 462H490" />
          <path d="M240 498H390" />
        </g>

        {/* Pulau kecil pendamping di kiri jauh */}
        <g opacity="0.85">
          <path
            d="M72 340L95 375L118 340H72Z"
            fill="#A82535"
          />
          <ellipse cx="95" cy="340" rx="28" ry="8" fill="#EDB664" />
          <circle cx="95" cy="326" r="12" fill="#F4813A" />
        </g>

        {/* Pulau melayang utama (batu marun-koral hangat & padang rumput emas) */}
        <g>
          {/* Bayangan di atas air */}
          <ellipse
            cx="330"
            cy="446"
            rx="165"
            ry="18"
            fill="#7F1D2B"
            opacity="0.22"
          />

          {/* Tebing bawah pulau */}
          <path
            d="M150 328L192 396L265 426L335 438L415 418L478 382L506 328H150Z"
            fill="url(#islandRock)"
          />
          {/* Faset kristal batu tebing */}
          <path
            d="M192 396L265 335L265 426L192 396Z"
            fill="#8E1F2E"
            opacity="0.65"
          />
          <path
            d="M335 340L415 418L335 438V340Z"
            fill="#7F1D2B"
            opacity="0.75"
          />
          <path
            d="M265 335L335 340L335 438L265 426V335Z"
            fill="#A82535"
          />

          {/* Permukaan rumput keemasan di atas pulau */}
          <ellipse cx="328" cy="324" rx="186" ry="38" fill="url(#meadowGold)" />
          <ellipse cx="328" cy="318" rx="170" ry="30" fill="#FCE5BE" />

          {/* Bukit kecil di atas pulau */}
          <path
            d="M175 318C205 274 285 272 325 318H175Z"
            fill="#EDB664"
          />
          <path
            d="M295 318C335 280 430 278 475 318H295Z"
            fill="#F8C99A"
          />

          {/* Jalan setapak petualangan belajar */}
          <path
            d="M235 342C265 328 295 322 330 315C365 308 395 312 430 326"
            stroke="#FFFBF4"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="2 18"
          />

          {/* Pepohonan fantasi merah-emas & oranye hangat */}
          {/* Pohon Kiri (Marun-Koral) */}
          <rect x="218" y="255" width="10" height="48" rx="4" fill="#7F1D2B" />
          <circle cx="204" cy="246" r="28" fill="url(#canopyCrimson)" />
          <circle cx="238" cy="242" r="32" fill="#D93A45" />
          <circle cx="222" cy="218" r="26" fill="#E4545A" />
          <circle cx="215" cy="212" r="8" fill="#FBD9B5" opacity="0.6" />

          {/* Pohon Tengah-Kiri (Keemasan) */}
          <rect x="276" y="264" width="8" height="40" rx="4" fill="#7F1D2B" />
          <circle cx="280" cy="248" r="26" fill="url(#canopyWarm)" />
          <circle cx="266" cy="258" r="18" fill="#EDB664" />
          <circle cx="294" cy="256" r="18" fill="#F4813A" />

          {/* Pondok/Pos Belajar Kecil di Tengah Pulau */}
          <rect
            x="325"
            y="264"
            width="48"
            height="38"
            rx="6"
            fill="#FFFBF4"
            stroke="#7F1D2B"
            strokeWidth="2.5"
          />
          <path
            d="M316 268L349 240L382 268H316Z"
            fill="#A82535"
            stroke="#7F1D2B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Jendela bercahaya emas */}
          <circle
            cx="349"
            cy="280"
            r="9"
            fill="#EDB664"
            stroke="#7F1D2B"
            strokeWidth="2"
          />

          {/* Pohon Kanan (Keemasan Cerah) */}
          <rect x="444" y="262" width="9" height="42" rx="4" fill="#7F1D2B" />
          <circle cx="448" cy="246" r="25" fill="url(#canopyWarm)" />
          <circle cx="432" cy="256" r="18" fill="#EDB664" />
        </g>

        {/* Bintang & partikel cahaya keemasan */}
        <g fill="#FFFBF4">
          <circle cx="150" cy="145" r="3.5" />
          <circle cx="515" cy="130" r="4" />
          <circle cx="485" cy="195" r="2.5" />
          <path d="M295 140L298 148L306 151L298 154L295 162L292 154L284 151L292 148L295 140Z" />
          <path d="M528 165L530 171L536 173L530 175L528 181L526 175L520 173L526 171L528 165Z" />
        </g>
      </svg>

      {/* Kartu Melayang Kiri Atas (seperti di gambar referensi) */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 max-w-[215px] rounded-2xl border border-[#EDB664]/80 bg-[#FFFBF4]/95 px-4 py-3 shadow-[0_10px_30px_rgba(127,29,43,0.12)] backdrop-blur-md">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#A82535]">
          <span className="h-2 w-2 rounded-full bg-[#F4813A] animate-pulse" />
          Ritme Hari Ini
        </div>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-[#4A1520] leading-snug">
          Belajar santai 15 menit mengikuti tenagamu
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="rounded-full bg-[#FFF4DF] px-2 py-0.5 text-[10px] font-medium text-[#8E1F2E] border border-[#EDB664]/60">
            🌤️ Lumayan
          </span>
          <span className="rounded-full bg-[#FBD9B5]/60 px-2 py-0.5 text-[10px] font-medium text-[#7F1D2B]">
            🔊 Suara Aktif
          </span>
        </div>
      </div>

      {/* Maskot Pijar di kanan atas pulau */}
      <div className="absolute right-6 bottom-24 sm:right-10 sm:bottom-28 z-20">
        <MascotPijar ekspresi="senang" ukuran="lg" />
      </div>

      {/* Kartu Melayang Bawah (seperti di gambar referensi) */}
      <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 z-20 flex items-center justify-between gap-3 rounded-2xl border border-[#EDB664]/90 bg-[#FFFBF4]/95 px-4 py-3 shadow-[0_12px_32px_rgba(127,29,43,0.16)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FBD9B5] to-[#EDB664] text-[#7F1D2B] shadow-inner">
            <MascotPijar ekspresi="idle" ukuran="sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#7F1D2B]">
                Pijar • Teman Belajar
              </span>
              <span className="rounded-full bg-[#FFF4DF] px-2 py-0.5 text-[10px] font-semibold text-[#D93A45] border border-[#EDB664]">
                Pos Dasar B3
              </span>
            </div>
            <p className="text-xs text-[#6E3B3B] line-clamp-1">
              &ldquo;Hari ini kita petualangan kecil di kebun jeruk, pelan-pelan saja ya!&rdquo;
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex shrink-0 items-center rounded-full bg-[#8E1F2E] px-3 py-1 text-[11px] font-semibold text-[#FFFBF4]">
          Siap Mulai ✦
        </span>
      </div>
    </div>
  );
}

/**
 * Ilustrasi Cerita Kebun Jeruk Keemasan (Section 5: Kartu Belajar)
 */
export function IlustrasiKebunCerita() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#EDB664]/70 bg-gradient-to-b from-[#FFF6E5] via-[#FBD9B5] to-[#EDB664]/60 aspect-[16/10]">
      <svg
        viewBox="0 0 400 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover"
      >
        <rect width="400" height="250" fill="#FFF5E2" />
        {/* Matahari lembut */}
        <circle cx="310" cy="70" r="46" fill="#FBD9B5" opacity="0.8" />
        <circle cx="310" cy="70" r="28" fill="#FFFBF4" />

        {/* Awan hangat */}
        <path
          d="M40 85C60 68 95 70 112 85C130 68 165 70 182 88H40V85Z"
          fill="#FFFBF4"
        />

        {/* Perbukitan keemasan */}
        <path
          d="M0 175C85 135 190 140 280 178C330 160 375 162 400 175V250H0V175Z"
          fill="#F8C99A"
        />
        <path
          d="M0 198C110 168 240 168 400 202V250H0V198Z"
          fill="#EDB664"
        />

        {/* Pohon Jeruk Keemasan Kiri */}
        <rect x="78" y="135" width="10" height="52" rx="4" fill="#7F1D2B" />
        <circle cx="83" cy="118" r="34" fill="#D93A45" />
        <circle cx="65" cy="128" r="22" fill="#E4545A" />
        <circle cx="101" cy="126" r="22" fill="#A82535" />
        {/* Buah jeruk emas */}
        <circle cx="72" cy="112" r="5" fill="#EDB664" />
        <circle cx="94" cy="116" r="5" fill="#FFFBF4" />
        <circle cx="82" cy="130" r="5" fill="#F4813A" />

        {/* Pohon Jeruk Keemasan Kanan */}
        <rect x="296" y="142" width="8" height="44" rx="4" fill="#7F1D2B" />
        <circle cx="300" cy="128" r="26" fill="#F4813A" />
        <circle cx="286" cy="135" r="18" fill="#EDB664" />
        <circle cx="314" cy="135" r="18" fill="#D93A45" />
      </svg>

      {/* Pijar di tengah kebun */}
      <div className="absolute inset-0 flex items-center justify-center pt-4">
        <MascotPijar ekspresi="senang" ukuran="md" />
      </div>
    </div>
  );
}

/**
 * Ilustrasi Peta 3 Pulau Melayang (Section 6: Setiap anak punya peta)
 */
export function IlustrasiPetaPulau() {
  return (
    <svg
      viewBox="0 0 1000 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute inset-0 h-full w-full object-cover"
    >
      <defs>
        <linearGradient id="mapSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF9EE" />
          <stop offset="55%" stopColor="#FBD9B5" />
          <stop offset="100%" stopColor="#F8C99A" />
        </linearGradient>
      </defs>
      <rect width="1000" height="360" fill="url(#mapSky)" />

      {/* Awan lembut di latar */}
      <circle cx="150" cy="90" r="65" fill="#FFFBF4" opacity="0.7" />
      <circle cx="220" cy="100" r="50" fill="#FFFBF4" opacity="0.7" />
      <circle cx="820" cy="85" r="70" fill="#FFFBF4" opacity="0.7" />
      <circle cx="750" cy="95" r="50" fill="#FFFBF4" opacity="0.7" />
      <circle cx="500" cy="60" r="95" fill="#FFFDF9" opacity="0.8" />

      {/* Laut keemasan di bawah */}
      <rect x="0" y="285" width="1000" height="75" fill="#EDB664" opacity="0.45" />

      {/* Jembatan gantung keemasan penghubung antar pulau */}
      <path
        d="M250 235 Q 375 275 500 205"
        stroke="#A82535"
        strokeWidth="4"
        strokeDasharray="8 6"
        fill="none"
      />
      <path
        d="M250 243 Q 375 283 500 213"
        stroke="#EDB664"
        strokeWidth="6"
        fill="none"
      />
      <path
        d="M500 205 Q 625 275 750 235"
        stroke="#A82535"
        strokeWidth="4"
        strokeDasharray="8 6"
        fill="none"
      />
      <path
        d="M500 213 Q 625 283 750 243"
        stroke="#EDB664"
        strokeWidth="6"
        fill="none"
      />

      {/* Pulau Kiri */}
      <path d="M125 235L165 305L220 320L275 295L305 235H125Z" fill="#8E1F2E" />
      <ellipse cx="215" cy="235" rx="95" ry="20" fill="#EDB664" />
      <circle cx="160" cy="200" r="28" fill="#D93A45" />
      <circle cx="185" cy="192" r="24" fill="#F4813A" />

      {/* Pulau Tengah (Titik Mulai B3) */}
      <path d="M400 205L450 290L505 310L565 285L600 205H400Z" fill="#7F1D2B" />
      <ellipse cx="500" cy="205" rx="105" ry="22" fill="#F4813A" />
      <ellipse cx="500" cy="201" rx="92" ry="16" fill="#FCE2B6" />

      {/* Pulau Kanan */}
      <path d="M695 235L735 300L790 318L845 295L875 235H695Z" fill="#A82535" />
      <ellipse cx="785" cy="235" rx="95" ry="20" fill="#EDB664" />
      <circle cx="835" cy="198" r="28" fill="#E4545A" />
      <circle cx="810" cy="192" r="22" fill="#EDB664" />
    </svg>
  );
}

