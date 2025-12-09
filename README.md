# 💪 IronLog AI - Smart Workout Tracker

<div align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Gemini_AI-Powered-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</div>

## 📖 About

**IronLog AI** is a modern, intelligent workout tracking application that combines sleek design with powerful AI capabilities. Built with React and powered by Google's Gemini AI, it helps fitness enthusiasts plan, track, and analyze their workouts with precision.

### ✨ Key Features

- **🤖 AI-Powered Workout Generation**: Generate personalized workout plans using natural language prompts
- **📅 Weekly Planning**: Organize your workouts by day with detailed exercise tracking
- **📊 Progress Analytics**: Track volume, sets, exercises, and muscle group focus
- **📈 Monthly Reports**: Comprehensive monthly performance summaries
- **📆 Calendar View**: Visual workout history with completion tracking
- **💾 Auto-Archive**: Automatic weekly workout archiving and history management
- **🎯 Exercise Details**: Track sets, reps, weight, muscle groups, and notes for each exercise
- **✅ Completion Tracking**: Mark exercises as complete with visual feedback
- **📱 Fully Responsive**: Optimized for mobile, tablet, and desktop devices
- **🌙 Dark Mode**: Beautiful dark theme with glassmorphism design
- **💿 Backup & Restore**: Export and import your workout data
- **📲 Android Support**: Built with Capacitor for native Android app deployment

### 🎨 Design Highlights

- Modern glassmorphism UI with smooth animations
- Intuitive touch-friendly interface
- Real-time digital clock display
- Progress bars and visual completion indicators
- Smooth transitions and micro-interactions
- Optimized scrolling and navigation

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Gemini API Key** (Get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MD-Abdul-Raheem/Workout_Tracker.git
   cd Workout_Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create or edit `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🏗️ Build & Deploy

### Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

### Build Android App

```bash
npm run build
npx cap sync android
npx cap open android
```

## 📱 Usage Guide

### Creating Workouts

1. **Manual Entry**: Click on any day card to add exercises manually
2. **AI Generation**: Use the AI Builder to generate workouts from text prompts
   - Example: "Chest and triceps hypertrophy workout"
   - Example: "Leg day with focus on quads"

### Tracking Progress

- Click the checkmark icon to mark exercises as complete
- Edit sets, reps, and weights directly in the table
- Add notes for each exercise
- View completion progress on the week overview

### Viewing History

- Access past workouts from the History view
- Browse by month with grouped entries
- View detailed statistics for each week
- Open any past workout to see exercise details

### Calendar Features

- Visual representation of workout completion
- Green dots indicate days with completed exercises
- Click any date to view that day's workout
- Navigate between months easily

### Reports & Analytics

- **Week Report**: Current week summary with total volume, sets, and top muscle focus
- **Monthly Report**: Comprehensive monthly statistics across all workouts
- Track your progress over time

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 5.2.0
- **Styling**: TailwindCSS 3.4.3
- **AI Integration**: Google Gemini AI (@google/genai)
- **Mobile**: Capacitor 7.4.4 (Android support)
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Storage**: LocalStorage for data persistence

## 📂 Project Structure

```
Workout_Tracker/
├── android/              # Android native project
├── components/           # React components
│   ├── CalendarModal.tsx
│   ├── Clock.tsx
│   ├── Counter.tsx
│   ├── Icon.tsx
│   └── Toast.tsx
├── services/            # API services
│   └── geminiService.ts
├── src/                 # Source files
│   └── index.css
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── types.ts             # TypeScript type definitions
├── capacitor.config.ts  # Capacitor configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies and scripts
```

## 🔑 Key Components

### App.tsx
Main application component handling:
- State management for workouts, history, and UI
- Weekly plan organization
- Auto-archiving logic
- Modal management
- Statistics calculations

### CalendarModal
Interactive calendar with:
- Month navigation
- Workout completion indicators
- Date selection
- Historical workout access

### GeminiService
AI integration for:
- Natural language workout generation
- Exercise recommendations
- Structured workout parsing

## 💾 Data Management

### Storage Keys
- `ironlog_data_v3`: Current weekly workout plan
- `ironlog_history_v1`: Archived workout history
- `ironlog_last_active_week_v1`: Week tracking for auto-archive
- `ironlog_titles_v1`: Custom workout titles

### Backup & Restore
- Export data as JSON file
- Import previous backups
- Version-controlled data format

## 🎯 Roadmap

- [ ] Progressive Web App (PWA) support
- [ ] Cloud sync across devices
- [ ] Exercise library with animations
- [ ] Social sharing features
- [ ] Custom workout templates
- [ ] Rest timer functionality
- [ ] Body measurements tracking
- [ ] Photo progress tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**MD Abdul Raheem**

- GitHub: [@MD-Abdul-Raheem](https://github.com/MD-Abdul-Raheem)
- Repository: [Workout_Tracker](https://github.com/MD-Abdul-Raheem/Workout_Tracker)

## 🙏 Acknowledgments

- Google Gemini AI for intelligent workout generation
- React team for the amazing framework
- Tailwind CSS for the utility-first styling
- Capacitor for cross-platform capabilities

## 📞 Support

If you have any questions or need help, please open an issue in the GitHub repository.

---

<div align="center">
  <strong>Built with 💪 and ❤️ for fitness enthusiasts</strong>
</div>
