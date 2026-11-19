# Uphill — design

## Cele trei concepte luate în calcul

**1. Uphill (ales).** Obiceiurile tale sunt o urcare pe munte. Fiecare obicei bifat te ridică cu câțiva metri, nivelurile sunt tabere, iar când ratezi vine frigul. Ecranul Today este muntele însuși, nu un panou cu carduri.

**2. Menajeria.** Fiecare obicei este o mică creatură pe care o crești; dacă o neglijezi, adoarme sau slăbește. Estetică de gravură în două cerneluri. Respins: cere zeci de ilustrații (creatură × stadii) ca să nu pară sărac, iar bucla zilnică devine „hrănește animalele”, nu „progresez”.

**3. Mâna de cărți.** În fiecare zi primești o „mână” de cărți (obiceiurile scadente) și le joci una câte una; nivelurile deblochează cărți rare. Fără lume, doar masa de joc. Respins: momentul bifării e puternic, dar nu există consecință vizibilă și nici un personaj la care să ții.

**De ce Uphill.** Este singurul concept în care fiecare cifră RPG are un echivalent fizic, deci nu trebuie explicat nimic:

| Mecanică | În lume |
| --- | --- |
| XP | metri urcați (1 XP = 1 m) |
| Nivel | tabăra la care ai ajuns |
| HP | căldura corpului |
| Streak | zile la rând fără furtună |
| Obicei ratat | vânt rece, apoi viscol; căldura scade |
| Recompensă | echipament care apare pe personaj |
| Quest | o porțiune de traseu cu nume |
| Light / Dark | urcare de zi / urcare de noapte |

## Premisa
Un munte fără nume, treizeci de tabere până la vârf. Nu îl urci într-o zi; îl urci în fiecare zi, câte puțin. Aplicația nu te felicită că „ai bifat”, îți arată că ești mai sus decât ieri.

## Personajul: Nim
Un mic alpinist cu glugă roșie și fular galben. Stă pe poteca din scena de sus, se uită spre vârf, tresare de bucurie când bifezi și tremură când e viscol.

Nim evoluează prin echipament, vizibil pe el:

| Tabără | Echipament |
| --- | --- |
| 1 | Fular |
| 5 | Felinar |
| 10 | Rucsac și piolet |
| 20 | Pelerină de furtună |
| 30 | Fanionul de vârf |

## Iconografie: marcaje turistice
Fiecare obicei are un marcaj de traseu, ca cele vopsite pe copaci și stânci în Carpați: o formă (bandă, cruce, triunghi, punct, romb) într-una din trei culori (roșu, galben, albastru) pe placă albă. Este un limbaj vizual real, local și imediat lizibil, și nu seamănă cu iconițele niciunei alte aplicații. Obiceiurile zilei sunt legate între ele de o potecă punctată: ziua se citește ca un traseu.

Al doilea motiv grafic sunt curbele de nivel (linii de hartă topografică), folosite discret ca textură pe carduri și în momentele mari.

## Statistici RPG legate de hobby-uri
Patru atribute; fiecare obicei antrenează unul:
- **Vigor**: corp (alergare, apă, stretching)
- **Focus**: minte (citit, studiu)
- **Craft**: creație (chitară, desen)
- **Calm**: odihnă (meditație, somn)

## Paleta
Trei culori primare de marcaj pe zăpadă sau pe noapte. Roșul este singurul accent de acțiune.

| Rol | Dark (noapte) | Light (zi) |
| --- | --- | --- |
| Fundal | `#0A1022` | `#F3F5F9` |
| Suprafață | `#131C36` | `#FFFFFF` |
| Text | `#EEF2FF` | `#14213A` |
| Text secundar | `#8A94B5` | `#5E6B85` |
| Roșu marcaj (acțiune, progres) | `#FF5B45` | `#E2412B` |
| Galben (căldură, tabără, lumină) | `#FFC857` | `#E9A30C` |
| Albastru (frig, vreme) | `#5B9BFF` | `#2563D9` |

Primul plan al scenei are exact culoarea fundalului, deci interfața stă literalmente pe munte: nu există graniță între „ilustrație” și „aplicație”.

## Tipografie
- **Big Shoulders** (Bold, Black) pentru cifre și titluri. Un condensat de afiș, ca pe indicatoarele de traseu și posterele vechi de parcuri naționale: altitudinea se citește de la distanță și ocupă puțin loc pe lățime.
- **Instrument Sans** pentru tot restul: neutru, cald, foarte lizibil la 12–14 px.

Două familii clar diferite: una strigă cifra, cealaltă explică.

## Principii de mișcare
1. **Tot ce e bun urcă.** Metrii câștigați plutesc în sus, contorul de altitudine numără în sus, Nim sare. Frigul coboară (zăpada cade).
2. **Lumea respiră încet, degetul primește răspuns repede.** Norii, fularul și ninsoarea sunt lente și cu contrast mic; orice atingere răspunde cu un spring scurt.
3. **Un moment mare pe realizare.** Tabără nouă și record de streak ocupă tot ecranul, cu fanioane, o singură dată. În rest, liniște.

„Reduce Motion” oprește buclele ambientale și scurtează momentele mari.

Haptic: atingere ușoară la selecții, impact mediu + succes la bifare, impact greu la tabără nouă. Nimic la derulare sau navigare repetată.

## Ce evită
- Carduri identice pentru orice. Cardurile apar doar unde conținutul chiar e un obiect (un quest).
- Glow și gradient mov-roz „de joc”.
- Mascote care amintesc de alte aplicații (păsări, flăcări cu ochi, bufnițe).
- Etichete cu majuscule spațiate, iconițe de bibliotecă, emoji.
- Vinovăție. Când ratezi, lumea se răcește, dar textul rămâne factual.

## Tehnic
Totul este desenat în cod: `react-native-svg` + `react-native-reanimated`, fără imagini. Skia rămâne neutilizat intenționat: pe web cere CanvasKit, iar scena nu are nevoie de el.
