// Tes perhitungan metrik Evaluasi AI (lib/evaluasi).

import { describe, expect, it } from "vitest";
import { ambilDataSimulasi, hitungMetrikLaporan, hitungMetrikLogAI, kelompokkanAlasan, persen } from "./index";

describe("metrik Evaluasi AI", () => {
  it("persen null jika belum ada data", () => {
    expect(persen(0, 0)).toBeNull();
    expect(persen(1, 3)).toBe(33.3);
  });

  it("keandalan per fitur dari LOG_AI", () => {
    const m = hitungMetrikLogAI([
      { fitur: "tutor", valid: true, pakai_fallback: false, waktu_respons_ms: 3000 },
      { fitur: "tutor", valid: false, pakai_fallback: true, waktu_respons_ms: 8000 },
      { fitur: "laporan", valid: true, pakai_fallback: false, waktu_respons_ms: null },
    ]);
    expect(m.find((x) => x.fitur === "tutor")).toEqual({
      fitur: "tutor",
      jumlah_panggilan: 2,
      rata_waktu_ms: 5500,
      persen_gagal: 50,
      persen_cadangan: 50,
    });
    expect(m.find((x) => x.fitur === "laporan")!.rata_waktu_ms).toBeNull();
  });

  it("laporan: persen dikirim tanpa diubah dan rata-rata suntingan", () => {
    expect(hitungMetrikLaporan(3, [{ diubah: false, besar_suntingan: 0 }, { diubah: true, besar_suntingan: 40 }])).toEqual({
      jumlah_draf: 3,
      jumlah_dikirim: 2,
      persen_tanpa_diubah: 50,
      rata_suntingan: 20,
    });
  });

  it("alasan penolakan diurutkan dari yang terbanyak", () => {
    expect(kelompokkanAlasan(["a", "b", "a"])).toEqual([{ alasan: "a", jumlah: 2 }, { alasan: "b", jumlah: 1 }]);
  });

  it("data simulasi selalu berlabel simulasi", () => {
    expect(ambilDataSimulasi().label).toMatch(/simulasi/i);
  });
});
