import { useState, useRef, useEffect } from 'react';
import { useI18n, type Language } from '../i18n/provider';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'ru' as Language, label: 'Русский', flagUrl: 'https://flagcdn.com/w40/ru.png' },
  { code: 'uz-lat' as Language, label: "O'zbekcha", flagUrl: 'https://flagcdn.com/w40/uz.png' },
  { code: 'uz-cyr' as Language, label: 'Ўзбекча', flagUrl: 'https://flagcdn.com/w40/uz.png' },
  { code: 'en' as Language, label: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
      >
        <img 
          src={currentLang.flagUrl} 
          alt={currentLang.label}
          className="flag-icon"
        />
        <span className="language-label">{currentLang.label}</span>
        <svg 
          className={`chevron ${isOpen ? 'open' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none"
        >
          <path 
            d="M4 6L8 10L12 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="language-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <img 
                  src={lang.flagUrl} 
                  alt={lang.label}
                  className="flag-icon"
                />
                <span>{lang.label}</span>
                {language === lang.code && (
                  <svg 
                    className="check-icon" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 16 16" 
                    fill="none"
                  >
                    <path 
                      d="M13 4L6 11L3 8" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
