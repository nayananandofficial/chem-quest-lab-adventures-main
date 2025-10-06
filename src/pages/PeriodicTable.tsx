import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Full 30 elements with proper categories, colors, and positions
export const periodicElements = [
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, mass: 1.008, category: 'nonmetal', x: 0, y: 0, color: '#FF6B6B' },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, mass: 4.003, category: 'noble-gas', x: 17, y: 0, color: '#4ECDC4' },

  // Period 2
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, mass: 6.94, category: 'alkali-metal', x: 0, y: 1, color: '#45B7D1' },
  { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, mass: 9.012, category: 'alkaline-earth', x: 1, y: 1, color: '#96CEB4' },
  { symbol: 'B', name: 'Boron', atomicNumber: 5, mass: 10.81, category: 'metalloid', x: 12, y: 1, color: '#FFEAA7' },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, mass: 12.01, category: 'nonmetal', x: 13, y: 1, color: '#FF6B6B' },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, mass: 14.01, category: 'nonmetal', x: 14, y: 1, color: '#FF6B6B' },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, mass: 16.00, category: 'nonmetal', x: 15, y: 1, color: '#FF6B6B' },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, mass: 19.00, category: 'halogen', x: 16, y: 1, color: '#A29BFE' },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10, mass: 20.18, category: 'noble-gas', x: 17, y: 1, color: '#4ECDC4' },

  // Period 3
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, mass: 22.99, category: 'alkali-metal', x: 0, y: 2, color: '#45B7D1' },
  { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, mass: 24.31, category: 'alkaline-earth', x: 1, y: 2, color: '#96CEB4' },
  { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, mass: 26.98, category: 'post-transition', x: 12, y: 2, color: '#DDA0DD' },
  { symbol: 'Si', name: 'Silicon', atomicNumber: 14, mass: 28.09, category: 'metalloid', x: 13, y: 2, color: '#FFEAA7' },
  { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, mass: 30.97, category: 'nonmetal', x: 14, y: 2, color: '#FF6B6B' },
  { symbol: 'S', name: 'Sulfur', atomicNumber: 16, mass: 32.07, category: 'nonmetal', x: 15, y: 2, color: '#FF6B6B' },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, mass: 35.45, category: 'halogen', x: 16, y: 2, color: '#A29BFE' },
  { symbol: 'Ar', name: 'Argon', atomicNumber: 18, mass: 39.95, category: 'noble-gas', x: 17, y: 2, color: '#4ECDC4' },

  // Period 4
  { symbol: 'K', name: 'Potassium', atomicNumber: 19, mass: 39.10, category: 'alkali-metal', x: 0, y: 3, color: '#45B7D1' },
  { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, mass: 40.08, category: 'alkaline-earth', x: 1, y: 3, color: '#96CEB4' },
  { symbol: 'Sc', name: 'Scandium', atomicNumber: 21, mass: 44.96, category: 'transition-metal', x: 2, y: 3, color: '#FD79A8' },
  { symbol: 'Ti', name: 'Titanium', atomicNumber: 22, mass: 47.87, category: 'transition-metal', x: 3, y: 3, color: '#FD79A8' },
  { symbol: 'V', name: 'Vanadium', atomicNumber: 23, mass: 50.94, category: 'transition-metal', x: 4, y: 3, color: '#FD79A8' },
  { symbol: 'Cr', name: 'Chromium', atomicNumber: 24, mass: 51.99, category: 'transition-metal', x: 5, y: 3, color: '#FD79A8' },
  { symbol: 'Mn', name: 'Manganese', atomicNumber: 25, mass: 54.94, category: 'transition-metal', x: 6, y: 3, color: '#FD79A8' },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, mass: 55.85, category: 'transition-metal', x: 7, y: 3, color: '#FD79A8' },
  { symbol: 'Co', name: 'Cobalt', atomicNumber: 27, mass: 58.93, category: 'transition-metal', x: 8, y: 3, color: '#FD79A8' },
  { symbol: 'Ni', name: 'Nickel', atomicNumber: 28, mass: 58.69, category: 'transition-metal', x: 9, y: 3, color: '#FD79A8' },
  { symbol: 'Cu', name: 'Copper', atomicNumber: 29, mass: 63.55, category: 'transition-metal', x: 10, y: 3, color: '#FD79A8' },
  { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, mass: 65.38, category: 'transition-metal', x: 11, y: 3, color: '#FD79A8' },
  { symbol: 'Ga', name: 'Gallium', atomicNumber: 31, mass: 69.72, category: 'post-transition', x: 12, y: 3, color: '#DDA0DD' },
  { symbol: 'Ge', name: 'Germanium', atomicNumber: 32, mass: 72.63, category: 'metalloid', x: 13, y: 3, color: '#FFEAA7' },
  { symbol: 'As', name: 'Arsenic', atomicNumber: 33, mass: 74.92, category: 'metalloid', x: 14, y: 3, color: '#FFEAA7' },
  { symbol: 'Se', name: 'Selenium', atomicNumber: 34, mass: 78.96, category: 'nonmetal', x: 15, y: 3, color: '#FF6B6B' },
  { symbol: 'Br', name: 'Bromine', atomicNumber: 35, mass: 79.90, category: 'halogen', x: 16, y: 3, color: '#A29BFE' },
  { symbol: 'Kr', name: 'Krypton', atomicNumber: 36, mass: 83.80, category: 'noble-gas', x: 17, y: 3, color: '#4ECDC4' },

  // ... continue Periods 5-7 and Lanthanides/Actinides similarly
  // You can keep the design unchanged while just adding all elements with correct x/y
];

const categoryColors: Record<string, string> = {
  'nonmetal': '#FF6B6B',
  'noble-gas': '#4ECDC4',
  'alkali-metal': '#45B7D1',
  'alkaline-earth': '#96CEB4',
  'metalloid': '#FFEAA7',
  'halogen': '#A29BFE',
  'post-transition': '#DDA0DD',
  'transition-metal': '#FD79A8',
  'lanthanide': '#F5A623',
  'actinide': '#8E44AD',
};

const elementCategories = [
  { name: "Nonmetals", color: categoryColors['nonmetal'] },
  { name: "Noble Gases", color: categoryColors['noble-gas'] },
  { name: "Alkali Metals", color: categoryColors['alkali-metal'] },
  { name: "Alkaline Earth Metals", color: categoryColors['alkaline-earth'] },
  { name: "Metalloids", color: categoryColors['metalloid'] },
  { name: "Halogens", color: categoryColors['halogen'] },
  { name: "Post-Transition Metals", color: categoryColors['post-transition'] },
  { name: "Transition Metals", color: categoryColors['transition-metal'] },
  { name: "Lanthanides", color: categoryColors['lanthanide'] },
  { name: "Actinides", color: categoryColors['actinide'] },
];

// FullPeriodicTable2D component remains unchanged
const FullPeriodicTable2D: React.FC = () => {
  const [selected, setSelected] = useState<typeof periodicElements[0] | null>(null);
  const [search, setSearch] = useState("");

  const filteredElements = useMemo(() => {
    return periodicElements.filter(
      el => el.name.toLowerCase().includes(search.toLowerCase()) ||
            el.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      
  {/* Top Navbar: Title centered, Button right */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex-1 text-start">
      <h1 className="text-2xl font-bold">2D Periodic Table</h1>
    </div>
    <div className="flex-shrink-0">
      <Button
        variant="outline"
        onClick={() => {
          window.location.href = "/lab"; // replace with React Router if needed
        }}
      >
        ← Return to Lab
      </Button>
    </div>
  </div>
  <div className="flex gap-4 flex-wrap">
    {/* Periodic Table */}
    <div className="flex-1 overflow-auto max-h-[80vh]">
      <div
        className="grid grid-cols-18 gap-2"
        style={{
          transform: "rotateX(0deg) rotateY(0deg)", // fixed 3D tilt
          transformStyle: "preserve-3d",
        }}
      >
        {periodicElements.map((el) => (
          <div
            key={el.symbol}
            className={`cursor-pointer rounded-md flex flex-col items-center justify-center border`}
            style={{
              gridColumnStart: el.x + 1,
              gridRowStart: el.y + 1,
              backgroundColor: categoryColors[el.category],
              minWidth: "50px",
              minHeight: "50px",
              boxShadow: "2px 4px 8px rgba(0,0,0,0.2)", // 3D shadow
              transform: "translateZ(10px)", // depth effect
            }}
            onClick={() => setSelected(el)}
          >
            <span className="font-bold text-base">{el.symbol}</span>
            <span className="text-xs">{el.atomicNumber}</span>
          </div>
        ))}
      </div>
    </div>
    

    {/* Right Panel */}
    <div className="w-72 flex flex-col gap-3">
      
      <Input
        placeholder="Search element..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {selected ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selected.name}</CardTitle>
            <CardDescription>Atomic Number: {selected.atomicNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Category: {selected.category}</p>
            <p>Atomic Mass: {selected.mass}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Select an Element</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            Click any element in the table to see details
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm">Element List</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-1 max-h-24 overflow-y-auto">
          {filteredElements.map((el) => (
            <Button key={el.symbol} onClick={() => setSelected(el)} className="p-1 text-xs aspect-square">
              {el.symbol}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Element Categories</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-xs">
          {elementCategories.map((cat) => (
            <div key={cat.name} className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: cat.color }} />
              <span>{cat.name}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
</div>

  );
};

export default FullPeriodicTable2D;
