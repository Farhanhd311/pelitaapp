# Color Palette: Latar Fantasi Api Merah Keemasan

Catatan: kode HEX adalah perkiraan dari gambar.

## Warna Dominan (Latar)

| Nama | HEX | Keterangan |
|---|---|---|
| Merah Marun Gelap | `#7F1D2B` | Sudut atas, area paling gelap |
| Merah Tua | `#8E1F2E` | Area tengah atas |
| Merah Krimson | `#A82535` | Area tengah |
| Merah Terang | `#D93A45` | Kobaran api / asap merah |

## Gradasi ke Bawah

| Nama | HEX | Keterangan |
|---|---|---|
| Merah Koral | `#E4545A` | Transisi tengah ke bawah |
| Merah Muda Salmon | `#EE7A7A` | Area bawah-tengah |
| Pink Peach | `#F3A08F` | Area paling bawah |

## Warna Aksen

| Nama | HEX | Keterangan |
|---|---|---|
| Krem / Peach Terang | `#FBD9B5` | Awan dan asap |
| Krem Keemasan | `#F8C99A` | Tepi awan, highlight |
| Oranye Api | `#F4813A` | Api di kanan bawah |
| Emas | `#EDB664` | Bintang dan garis dekorasi |

## Rekomendasi Penggunaan

| Elemen | HEX |
|---|---|
| Latar utama (gradien vertikal) | `#8E1F2E` ke `#D93A45` |
| Teks / judul | `#FBD9B5` atau `#EDB664` |
| Tombol / highlight | `#F4813A` |
| Ornamen / garis | `#EDB664` |

## CSS Variables

```css
:root {
  --merah-marun: #7F1D2B;
  --merah-tua: #8E1F2E;
  --merah-krimson: #A82535;
  --merah-terang: #D93A45;
  --merah-koral: #E4545A;
  --salmon: #EE7A7A;
  --pink-peach: #F3A08F;
  --krem: #FBD9B5;
  --krem-emas: #F8C99A;
  --oranye-api: #F4813A;
  --emas: #EDB664;
}

.background {
  background: linear-gradient(
    to bottom,
    #7F1D2B 0%,
    #A82535 40%,
    #D93A45 65%,
    #EE7A7A 85%,
    #F3A08F 100%
  );
}
```
