import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      className="btn btn-ghost btn-icon"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
      style={{ fontSize: '1.2rem', color: isDark ? '#fbbf24' : '#6366f1' }}
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </motion.button>
  );
};

export default ThemeToggle;
