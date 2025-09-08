# Chemistry Lab Adventures

An interactive 3D chemistry laboratory simulation built with React Three Fiber.

## Features

- **3D Lab Equipment**: Realistic beakers, flasks, and other lab equipment rendered using Three.js
- **Chemical Reactions**: Visual simulation of chemical reactions and properties
- **Interactive Controls**: Temperature control, mixing, and chemical combination
- **Real-time Physics**: Liquid simulation and particle effects
- **Database Integration**: Chemical properties and reactions stored in Supabase

## Tech Stack

- **Frontend**: React, TypeScript, Three.js
- **3D Graphics**: React Three Fiber, Drei
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Getting Started

1. **Clone the repository**

```sh
git clone <repository-url>
cd chem-quest-lab-adventures
```

2; **Install dependencies**

```sh
npm install
```

3; **Set up environment variables**
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4; **Start development server**

```sh
npm run dev
```

## Project Structure

```sh
src/
├── components/         # React components
│   ├── AdvancedEquipmentModels.tsx    # 3D lab equipment
│   ├── AdvancedChemistryVisuals.tsx   # Visual effects
│   └── EnhancedLabEquipment.tsx       # Equipment logic
├── models/            # 3D model files
├── supabase/         # Database configuration
└── types/            # TypeScript definitions
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
