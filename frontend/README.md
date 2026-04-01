# Frontend - SmartLearn UI

Modern React application built with Vite and TailwindCSS.

## 📁 Structure

```
frontend/
├── src/
│   ├── pages/                    # Page components
│   │   ├── Home.jsx             # Landing page
│   │   ├── Login.jsx            # Login page
│   │   ├── Signup.jsx           # Registration
│   │   ├── VideoSummarizer.jsx  # Video feature
│   │   ├── QuizGenerator.jsx    # Quiz feature
│   │   ├── MathSolver.jsx       # Math feature
│   │   ├── HandwritingRecognition.jsx
│   │   └── VirtualTutor.jsx     # Chat feature
│   │
│   ├── components/              # Reusable components
│   │   └── Navbar.jsx          # Navigation bar
│   │
│   ├── context/                 # React Context
│   │   └── AuthContext.jsx     # Authentication state
│   │
│   ├── App.jsx                  # Main app & routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
│
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
└── tailwind.config.js          # TailwindCSS config
```

## 🔧 Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (create `.env`):
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🎨 Design System

### Colors
- **Primary**: `#7C3AED` (Purple)
- **Secondary**: `#FDE047` (Yellow)
- **Accent**: `#0F172A` (Dark)

### Components
- **Glass Card**: Frosted glass effect with backdrop blur
- **Glass Pill**: Rounded badge with translucent background
- **Button Primary**: Purple gradient with shadow
- **Button Secondary**: White with border

### Typography
- **Headings**: Outfit font, extrabold
- **Body**: Inter font, regular

## 🔑 Key Features

### Authentication
- JWT token storage in localStorage
- Automatic token refresh
- Protected routes with `<ProtectedRoute>`

### Routing
- React Router v7
- Lazy loading for code splitting
- Protected routes for authenticated users

### State Management
- React Context for global auth state
- Local state for component-specific data

## 🐛 Common Issues

**Build fails**:
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**API calls fail**:
- Check `VITE_API_URL` in `.env`
- Ensure backend is running

**Styles not loading**:
- Clear browser cache
- Restart dev server
