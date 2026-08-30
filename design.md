# Monopoly Board Design Specification (`design.md`)

This document provides the complete architectural, geometric, visual, and typographic design specification for the **Monopoly Board**.

---

## 1. Board Geometry & Layout Grid

The board is structured on an exact **11×11 CSS Grid** within a **1024px × 1024px** square container.

```
+-------------------------------------------------------------------------------+
|  CORNER (TL)   |            9 TOP EDGE TILES (81.78px each)    |  CORNER (TR) |
| (144px x 144px)|                                               |(144px x 144px)|
+----------------+-----------------------------------------------+---------------+
|                |                                               |               |
| 9 LEFT EDGE    |                                               | 9 RIGHT EDGE  |
| TILES          |                 CENTER AREA                   | TILES         |
| (81.78px each) |               (736px x 736px)                 | (81.78px each)|
|                |                                               |               |
+----------------+-----------------------------------------------+---------------+
|  CORNER (BL)   |          9 BOTTOM EDGE TILES (81.78px each)   |  CORNER (BR)  |
| (144px x 144px)|                                               |(144px x 144px)|
+-------------------------------------------------------------------------------+
```

### Grid Dimensions

- **Container**: `1024px × 1024px` (`width: 1024px; height: 1024px;`)
- **Corner Squares**: `144px × 144px` (4 corners: Top-Left, Top-Right, Bottom-Left, Bottom-Right)
- **Perimeter Edge Tiles**: `81.777778px` each (`9 tiles` per side)
- **Center Area**: `736px × 736px` (`grid-column: 2 / 11; grid-row: 2 / 11;`)
- **Outer Border**: `2px solid #000000`
- **Internal Cell Dividers**: `1.5px solid #000000`
- **Background Canvas**: `#c9daf8`

---

## 2. Color Palette & Hex Standards

| Element / Group           | Color Name           | Hex Code              | Visual Preview / Description                               |
| :------------------------ | :------------------- | :-------------------- | :--------------------------------------------------------- |
| **Canvas Background**     | Board Blue           | `#c9daf8`             | Primary surface for all cells & center area                |
| **Grid Lines & Borders**  | Deep Ink Black       | `#000000`             | Perimeter frame and cell dividing lines                    |
| **Group 1 (Brown)**       | Warm Ochre / Brown   | `#ba9664`             | San Diego Drive (Sq 1), Kansas Drive (Sq 3)                |
| **Group 2 (Light Blue)**  | Sky Blue             | `#6ccef5`             | Vermont (Sq 6), Phoenix (Sq 8), Boston (Sq 9)              |
| **Group 3 (Pink)**        | Magenta Pink         | `#ee5ba1`             | Olivia Gardens (Sq 11), California (Sq 13), States (Sq 14) |
| **Group 4 (Orange)**      | Vivid Orange         | `#f6931e`             | Bethany (Sq 16), New York (Sq 18), Atlanta (Sq 19)         |
| **Group 5 (Red)**         | Classic Crimson      | `#eb1c24`             | Almond (Sq 21), Clement (Sq 23), Pacific (Sq 24)           |
| **Group 6 (Yellow)**      | Amber Gold           | `#ffc905`             | Rodeo (Sq 26), Nashville (Sq 27), Oakville (Sq 29)         |
| **Group 7 (Green)**       | Leaf Green           | `#a5cd39`             | Atlantic (Sq 31), Clement (Sq 32), Riverside (Sq 34)       |
| **Group 8 (Dark Blue)**   | Royal Cerulean       | `#008ed2`             | Folklore Heights (Sq 37), Salt Lake (Sq 39)                |
| **Special Utility Icons** | Accent Gold / Silver | `#fdb813` / `#aee5fc` | Chest lock, diamond sparkles, water faucet                 |

---

## 3. Four Corner Design Specifications

Each corner tile occupies a `144px × 144px` area with custom vector SVG artwork and angled typography:

### 1. Top-Left Corner (Index 20) — `FREE PARKING`

- **Visuals**: Vector black Volkswagen Beetle silhouette (`viewBox="0 0 68 34"`) with `#c9daf8` hubcaps.
- **Orientation**: Car rotated `-45°`, centered at `top: 55px; left: 58px;`.
- **Typography**: "FREE PARKING" rotated `135°` (`top: 104px; left: 106px;`), 11px bold uppercase, tracking `0.5px`.

### 2. Top-Right Corner (Index 30) — `GO TO JAIL`

- **Visuals**: Rotated `45°` jail cell grating SVG with 4 vertical bars and 2 horizontal cross-beams.
- **Orientation**: Grating positioned at `top: 58px; left: 86px;`.
- **Typography**: "GO TO JAIL" rotated `-135°` (`top: 102px; left: 38px;`), 11px bold uppercase, tracking `0.5px`.

### 3. Bottom-Left Corner (Index 10) — `IN JAIL / JUST VISITING`

- **Visuals**: Central cell grating rotated `-45°` (`top: 62px; left: 72px;`).
- **Inner Zone**: "IN JAIL" rotated `-45°` (`top: 28px; left: 114px;`), 10.5px bold.
- **Outer L-Corridor**: "JUST VISITING" rotated `45°` (`top: 112px; left: 34px;`), 10px bold.

### 4. Bottom-Right Corner (Index 0) — `GO`

- **Visuals**: Solid red polygon arrow (`#eb1c24`, `polygon points="0,22.5 28,0 28,14 60,14 60,31 28,31 28,45"`).
- **Typography**: "COLLECT $200 SALARY AS YOU PASS" rotated `-45°` (`top: 52px; left: 48px;`), 10.5px bold with 12px price highlight.

---

## 4. Perimeter Edge Tile Architecture (40 Squares Clockwise)

### Square Indices & Edge Mapping

```
[20] FREE PARKING  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | [30] GO TO JAIL
-------------------+--------------------------------------------+------------------
 19  Atlanta       |                                            |  31  Atlantic
 18  New York      |                                            |  32  Clement
 17  Comm Chest    |                                            |  33  Comm Chest
 16  Bethany       |                                            |  34  Riverside
 15  Manhattan RR  |                 CENTER AREA                |  35  Short Line
 14  States        |               (736px x 736px)              |  36  Chance
 13  California    |                                            |  37  Folklore
 12  Car Company   |                                            |  38  Luxury Tax
 11  Olivia        |                                            |  39  Salt Lake
-------------------+--------------------------------------------+------------------
[10] IN JAIL       |  9 |  8 |  7 |  6 |  5 |  4 |  3 |  2 |  1 | [ 0] GO (START)
```

### Edge-by-Edge Specifications

#### 1. Bottom Edge (Squares 1 to 9, Right to Left)

- **Dimensions**: `flex: 1; height: 144px; border-right: 1.5px solid #000000; border-top: 2px solid #000000;`
- **Color Bar**: `top: 0; left: 0; width: 100%; height: 38px; border-bottom: 1.5px solid #000000;`
- **Typography**: Name centered at `top: 63px`, Price centered at `top: 129px`.
- **Squares**:
  - `Sq 1`: San Diego Drive (Brown, $60)
  - `Sq 2`: Community Chest (Golden treasure chest SVG)
  - `Sq 3`: Kansas Drive (Brown, M90)
  - `Sq 4`: Income Tax ("PAY M150")
  - `Sq 5`: Beverly Railroad (Locomotive SVG, M200)
  - `Sq 6`: Vermont Drive (Light Blue, M120)
  - `Sq 7`: Chance (Purple question mark SVG)
  - `Sq 8`: Phoenix Drive (Light Blue, M130)
  - `Sq 9`: Boston Drive (Light Blue, M150)

#### 2. Left Edge (Squares 11 to 19, Bottom to Top)

- **Dimensions**: `flex: 1; width: 144px; height: 81.78px; border-bottom: 1.5px solid #000000; border-right: 2px solid #000000;`
- **Color Bar**: `top: 0; right: 0; width: 38px; height: 100%; border-left: 1.5px solid #000000;`
- **Typography**: Rotated `90°`. Name centered at `left: 82px`, Price centered at `left: 16px`.
- **Squares**:
  - `Sq 11`: Olivia Gardens (Pink, M140)
  - `Sq 12`: Car Company (Blue sedan SVG, M150)
  - `Sq 13`: California Drive (Pink, M160)
  - `Sq 14`: States Drive (Pink, M140)
  - `Sq 15`: Manhattan Railroad (Locomotive SVG, M200)
  - `Sq 16`: Bethany Drive (Orange, M180)
  - `Sq 17`: Community Chest (Golden treasure chest SVG)
  - `Sq 18`: New York Drive (Orange, M200)
  - `Sq 19`: Atlanta Drive (Orange, M200)

#### 3. Top Edge (Squares 21 to 29, Left to Right)

- **Dimensions**: `flex: 1; height: 144px; border-right: 1.5px solid #000000; border-bottom: 2px solid #000000;`
- **Color Bar**: `bottom: 0; left: 0; width: 100%; height: 38px; border-top: 1.5px solid #000000;`
- **Typography**: Rotated `180°`. Name centered at `top: 82px`, Price centered at `top: 16px`.
- **Squares**:
  - `Sq 21`: Almond Drive (Red, M200)
  - `Sq 22`: Chance (Purple question mark SVG)
  - `Sq 23`: Clement Drive (Red, M200)
  - `Sq 24`: Pacific Drive (Red, M260)
  - `Sq 25`: Water Works (Faucet & pipes SVG, M60)
  - `Sq 26`: Rodeo Drive (Yellow, $260)
  - `Sq 27`: Nashville Drive (Yellow, M260)
  - `Sq 28`: Railroad (Station & semaphore signal SVG, M130)
  - `Sq 29`: Oakville (Yellow, M230)

#### 4. Right Edge (Squares 31 to 39, Top to Bottom)

- **Dimensions**: `flex: 1; width: 144px; height: 81.78px; border-bottom: 1.5px solid #000000; border-left: 2px solid #000000;`
- **Color Bar**: `top: 0; left: 0; width: 38px; height: 100%; border-right: 1.5px solid #000000;`
- **Typography**: Rotated `-90°`. Name centered at `left: 63px`, Price centered at `left: 129px`.
- **Squares**:
  - `Sq 31`: Atlantic Drive (Green, M300)
  - `Sq 32`: Clement Drive (Green, M300)
  - `Sq 33`: Community Chest (Golden treasure chest SVG)
  - `Sq 34`: Riverside (Green, M250)
  - `Sq 35`: Short Line (Locomotive SVG, M200)
  - `Sq 36`: Chance (Black question mark SVG)
  - `Sq 37`: Folklore Heights (Dark Blue, M200)
  - `Sq 38`: Luxury Tax (Diamond ring with sparkles SVG, PAY M200)
  - `Sq 39`: Salt Lake / Boardwalk (Dark Blue, M350)

---

## 5. Typography Standards

```css
/* Typography Rules */
font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;

/* Property Street Titles */
.tile-name {
  font-size: 8px;
  font-weight: bold;
  letter-spacing: 0.4px;
  line-height: 1.22;
  color: #000000;
  white-space: nowrap;
}

/* Price Figures */
.tile-price {
  font-size: 8px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: #000000;
  white-space: nowrap;
}

/* Special Non-Street Titles */
.tile-name-special {
  font-size: 8.5px;
  font-weight: bold;
  letter-spacing: 0.4px;
  line-height: 1.18;
  color: #000000;
  white-space: nowrap;
}
```

---

## 6. Interactive Overlay & Game Layer

An absolute interactive layer (`renderTileOverlay`) overlays the vector board grid to handle game state updates:

1. **Click Inspection**:
   - Clicking any square triggers `setInspectedPropertyIndex(index)`, opening the property deed card with mortgage/unmortgage and house building tools.
2. **Player Token Placement**:
   - Badges (`TokenBadge`) automatically render on the bottom-right of the occupied cell with player color, icon, and turn halo animation.
3. **House & Hotel Building Pips**:
   - `HouseHotelPips` renders 1–4 green houses or 1 red hotel directly on the property's color band.
4. **Ownership Indicator**:
   - A 12px circular pip displaying the owning player's token color sits on the corner of owned properties.
5. **Mortgaged Property Overlay**:
   - A semi-transparent overlay (`rgba(0,0,0,0.6)`) with a red rotated `MORTGAGED` stamp displays over mortgaged squares.
6. **Responsive Auto-Scaling**:
   - A `ResizeObserver` calculates `scale = containerWidth / 1024`, scaling the entire 1024×1024 board smoothly down to any screen size with `transform: scale(scale); transform-origin: top left;`.
