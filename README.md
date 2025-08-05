# Freesio Therapist 🏥

**Your AI-Powered Personal Physiotherapy Assistant**

Freesio Therapist is a comprehensive web application that provides personalized physiotherapy exercises with real-time AI analysis and feedback. Built for TerraHacks 2025, this platform combines modern web technologies with advanced AI to make physiotherapy accessible and effective for everyone.

## 🌟 Features

### 🎯 Core Functionality
- **AI-Powered Exercise Recommendations**: Personalized therapy exercises based on user profile and pain assessment
- **Real-Time Pose Analysis**: Advanced pose detection and movement analysis using MediaPipe
- **Interactive Body Map**: Visual pain assessment tool for targeted exercise selection
- **Smart Scheduling**: Automated therapy session planning with calendar integration
- **Progress Tracking**: Comprehensive analytics and progress monitoring
- **User Profiles**: Complete health profile management with biometric tracking

### 🔧 Technical Features
- **Google Gemini AI Integration**: Advanced exercise prescription and form analysis
- **Supabase Backend**: Secure user authentication and data management
- **Responsive Design**: Beautiful, modern UI with smooth animations
- **Real-time Feedback**: Instant form correction and rep counting
- **YouTube Integration**: Exercise demonstration videos

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cenesdeveloper/Terrahacks.git
   cd terrahacks2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_ai_api_key
   ```

4. **Database Setup**
   Run the provided SQL scripts in your Supabase dashboard:
   ```bash
   # Execute these files in Supabase SQL Editor
   database/create_user_exercises_table.sql
   database/create_user_sessions_table.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
terrahacks2025/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── exercise-recommendation/  # AI exercise suggestions
│   │   ├── exercise-prescription/    # Exercise setup & analysis
│   │   ├── google-calendar/         # Calendar integration
│   │   └── weekly-sessions/         # Session management
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main user dashboard
│   ├── body-map/                 # Interactive pain assessment
│   ├── calendar/                 # Schedule management
│   ├── exercises/                # Exercise library
│   ├── progress/                 # Analytics & tracking
│   └── physio-coach/             # AI coaching interface
├── components/                   # Reusable React components
├── hooks/                        # Custom React hooks
├── service/                      # Business logic & API calls
├── supabase/                     # Database client configuration
└── database/                     # SQL schema files
```

## 🎨 Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI/ML**: Google Gemini AI, MediaPipe Pose Detection
- **Styling**: Tailwind CSS with custom animations
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## 🔗 API Endpoints

### Exercise Management
- `POST /api/exercise-recommendation` - Get AI exercise suggestions
- `POST /api/exercise-prescription` - Setup exercise with pose analysis
- `POST /api/exercise-setup` - Configure exercise parameters

### Session Management  
- `POST /api/create-session` - Create new therapy session
- `POST /api/complete-session` - Mark session as completed
- `GET /api/weekly-sessions` - Retrieve weekly schedule

### Integration
- `GET /api/google-calendar` - Calendar synchronization
- `GET /api/youtube-search` - Exercise demonstration videos

## 👥 User Flow

1. **Registration/Login**: Secure authentication via Supabase
2. **Profile Setup**: Complete health profile and fitness assessment
3. **Pain Assessment**: Use interactive body map to identify problem areas
4. **AI Exercise Prescription**: Receive personalized exercise recommendations
5. **Real-time Training**: Perform exercises with live pose analysis
6. **Progress Tracking**: Monitor improvement over time
7. **Schedule Management**: Plan and track therapy sessions

## 🎯 Target Audience

- **Patients** recovering from injuries or managing chronic pain
- **Physiotherapy Students** learning proper exercise techniques
- **Healthcare Professionals** seeking digital therapy tools
- **Fitness Enthusiasts** wanting professional exercise guidance


## 🏆 TerraHacks 2025

Built with ❤️ for TerraHacks 2025 - Empowering healthcare through technology.


**Made with 💪 by the Freesio Team** | [Live Demo](https://freesiotherapist.vercel.app)
