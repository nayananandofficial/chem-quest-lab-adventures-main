import React, { useState, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Atom, 
  Zap, 
  Thermometer, 
  Weight,
  Layers,
  Eye,
  Info
} from 'lucide-react';
import * as THREE from 'three';

// Periodic table data (simplified)
const elements = [
  { symbol: 'H', name: 'Hydrogen', number: 1, mass: 1.008, category: 'nonmetal', x: 0, y: 0, color: '#FF6B6B' },
  { symbol: 'He', name: 'Helium', number: 2, mass: 4.003, category: 'noble-gas', x: 17, y: 0, color: '#4ECDC4' },
  { symbol: 'Li', name: 'Lithium', number: 3, mass: 6.94, category: 'alkali-metal', x: 0, y: 1, color: '#45B7D1' },
  { symbol: 'Be', name: 'Beryllium', number: 4, mass: 9.012, category: 'alkaline-earth', x: 1, y: 1, color: '#96CEB4' },
  { symbol: 'B', name: 'Boron', number: 5, mass: 10.81, category: 'metalloid', x: 12, y: 1, color: '#FFEAA7' },
  { symbol: 'C', name: 'Carbon', number: 6, mass: 12.01, category: 'nonmetal', x: 13, y: 1, color: '#FF6B6B' },
  { symbol: 'N', name: 'Nitrogen', number: 7, mass: 14.01, category: 'nonmetal', x: 14, y: 1, color: '#FF6B6B' },
  { symbol: 'O', name: 'Oxygen', number: 8, mass: 16.00, category: 'nonmetal', x: 15, y: 1, color: '#FF6B6B' },
  { symbol: 'F', name: 'Fluorine', number: 9, mass: 19.00, category: 'halogen', x: 16, y: 1, color: '#A29BFE' },
  { symbol: 'Ne', name: 'Neon', number: 10, mass: 20.18, category: 'noble-gas', x: 17, y: 1, color: '#4ECDC4' },
  { symbol: 'Na', name: 'Sodium', number: 11, mass: 22.99, category: 'alkali-metal', x: 0, y: 2, color: '#45B7D1' },
  { symbol: 'Mg', name: 'Magnesium', number: 12, mass: 24.31, category: 'alkaline-earth', x: 1, y: 2, color: '#96CEB4' },
  { symbol: 'Al', name: 'Aluminum', number: 13, mass: 26.98, category: 'post-transition', x: 12, y: 2, color: '#DDA0DD' },
  { symbol: 'Si', name: 'Silicon', number: 14, mass: 28.09, category: 'metalloid', x: 13, y: 2, color: '#FFEAA7' },
  { symbol: 'P', name: 'Phosphorus', number: 15, mass: 30.97, category: 'nonmetal', x: 14, y: 2, color: '#FF6B6B' },
  { symbol: 'S', name: 'Sulfur', number: 16, mass: 32.07, category: 'nonmetal', x: 15, y: 2, color: '#FF6B6B' },
  { symbol: 'Cl', name: 'Chlorine', number: 17, mass: 35.45, category: 'halogen', x: 16, y: 2, color: '#A29BFE' },
  { symbol: 'Ar', name: 'Argon', number: 18, mass: 39.95, category: 'noble-gas', x: 17, y: 2, color: '#4ECDC4' },
  { symbol: 'K', name: 'Potassium', number: 19, mass: 39.10, category: 'alkali-metal', x: 0, y: 3, color: '#45B7D1' },
  { symbol: 'Ca', name: 'Calcium', number: 20, mass: 40.08, category: 'alkaline-earth', x: 1, y: 3, color: '#96CEB4' },
  { symbol: 'Fe', name: 'Iron', number: 26, mass: 55.85, category: 'transition-metal', x: 7, y: 3, color: '#FD79A8' },
  { symbol: 'Cu', name: 'Copper', number: 29, mass: 63.55, category: 'transition-metal', x: 10, y: 3, color: '#FD79A8' },
  { symbol: 'Zn', name: 'Zinc', number: 30, mass: 65.38, category: 'transition-metal', x: 11, y: 3, color: '#FD79A8' },
  { symbol: 'Ag', name: 'Silver', number: 47, mass: 107.87, category: 'transition-metal', x: 10, y: 4, color: '#FD79A8' },
  { symbol: 'Au', name: 'Gold', number: 79, mass: 196.97, category: 'transition-metal', x: 10, y: 5, color: '#FD79A8' },
];

interface ElementCubeProps {
  element: any;
  position: [number, number, number];
  selected: boolean;
  onSelect: () => void;
  hover: boolean;
  onHover: (hover: boolean) => void;
}

const ElementCube: React.FC<ElementCubeProps> = ({ element, position, selected, onSelect, hover, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      if (selected) {
        meshRef.current.rotation.y += 0.02;
        meshRef.current.scale.setScalar(1.1);
      } else if (hover) {
        meshRef.current.scale.setScalar(1.05);
      } else {
        meshRef.current.rotation.y = 0;
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={[1, 1, 1]}
        onClick={onSelect}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
      >
        <meshStandardMaterial 
          color={selected ? '#FFD700' : hover ? '#FFFFFF' : element.color} 
          transparent
          opacity={0.8}
        />
      </Box>
      <Text
        position={[0, 0, 0.51]}
        fontSize={0.15}
        color="black"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        {element.symbol}
      </Text>
      <Text
        position={[0, -0.2, 0.51]}
        fontSize={0.08}
        color="black"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-regular.woff"
      >
        {element.number}
      </Text>
    </group>
  );
};

const PeriodicTable3D: React.FC<{ onElementSelect: (element: any) => void, selectedElement: any }> = ({ 
  onElementSelect, 
  selectedElement 
}) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight position={[0, 5, 5]} intensity={0.8} />
      
      {elements.map((element) => (
        <ElementCube
          key={element.symbol}
          element={element}
          position={[element.x - 8.5, 3 - element.y, 0]}
          selected={selectedElement?.symbol === element.symbol}
          onSelect={() => onElementSelect(element)}
          hover={hoveredElement === element.symbol}
          onHover={(hover) => setHoveredElement(hover ? element.symbol : null)}
        />
      ))}
    </>
  );
};

const PeriodicTable = () => {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view3D, setView3D] = useState(true);

  const filteredElements = elements.filter(element => 
    element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    element.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'nonmetal': 'bg-red-500',
      'noble-gas': 'bg-teal-500',
      'alkali-metal': 'bg-blue-500',
      'alkaline-earth': 'bg-green-500',
      'metalloid': 'bg-yellow-500',
      'halogen': 'bg-purple-500',
      'post-transition': 'bg-pink-500',
      'transition-metal': 'bg-rose-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Atom className="h-8 w-8 text-primary" />
                3D Periodic Table
              </h1>
              <p className="text-muted-foreground mt-2">Explore chemical elements in interactive 3D</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search elements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Button
                variant={view3D ? "default" : "outline"}
                onClick={() => setView3D(!view3D)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {view3D ? '3D View' : 'Grid View'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main View */}
          <div className="lg:col-span-2">
            {view3D ? (
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Interactive 3D View
                  </CardTitle>
                  <CardDescription>
                    Click and drag to rotate, scroll to zoom, click elements to select
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 h-[500px]">
                  <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                    <OrbitControls 
                      enablePan={true}
                      enableZoom={true}
                      enableRotate={true}
                      maxDistance={30}
                      minDistance={8}
                    />
                    <PeriodicTable3D 
                      onElementSelect={setSelectedElement}
                      selectedElement={selectedElement}
                    />
                  </Canvas>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Element Grid</CardTitle>
                  <CardDescription>Browse all elements in a traditional grid layout</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                    {filteredElements.map((element) => (
                      <Button
                        key={element.symbol}
                        variant={selectedElement?.symbol === element.symbol ? "default" : "outline"}
                        className="aspect-square p-2"
                        onClick={() => setSelectedElement(element)}
                      >
                        <div className="text-center">
                          <div className="font-bold text-sm">{element.symbol}</div>
                          <div className="text-xs opacity-70">{element.number}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Element Details */}
          <div>
            {selectedElement ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedElement.name}</CardTitle>
                      <CardDescription>Element #{selectedElement.number}</CardDescription>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {selectedElement.symbol}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div>
                    <Badge className={`text-white ${getCategoryColor(selectedElement.category)}`}>
                      {selectedElement.category.replace('-', ' ')}
                    </Badge>
                  </div>

                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="properties">Properties</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Atomic Mass:</span>
                          <span className="text-sm">{selectedElement.mass} u</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Atom className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Atomic Number:</span>
                          <span className="text-sm">{selectedElement.number}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Category:</span>
                          <span className="text-sm capitalize">{selectedElement.category.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="properties" className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        <p>Detailed properties and characteristics of {selectedElement.name} would be displayed here.</p>
                        <p className="mt-2">This could include:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Electron configuration</li>
                          <li>Physical properties</li>
                          <li>Chemical properties</li>
                          <li>Common uses</li>
                          <li>Discovery information</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Select an Element
                  </CardTitle>
                  <CardDescription>
                    Click on any element to view detailed information
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="text-center py-8">
                    <Atom className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Choose an element from the {view3D ? '3D periodic table' : 'grid'} to learn more about its properties and characteristics.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Legend */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Element Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {[
                    { name: 'Non-metals', category: 'nonmetal' },
                    { name: 'Noble gases', category: 'noble-gas' },
                    { name: 'Alkali metals', category: 'alkali-metal' },
                    { name: 'Alkaline earth', category: 'alkaline-earth' },
                    { name: 'Metalloids', category: 'metalloid' },
                    { name: 'Halogens', category: 'halogen' },
                    { name: 'Transition metals', category: 'transition-metal' },
                    { name: 'Post-transition', category: 'post-transition' }
                  ].map(({ name, category }) => (
                    <div key={category} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${getCategoryColor(category)}`}></div>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodicTable;