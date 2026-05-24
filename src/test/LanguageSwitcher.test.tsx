import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '../i18n/provider';
import LanguageSwitcher from '../components/LanguageSwitcher';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <I18nProvider>
        {children}
      </I18nProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe('LanguageSwitcher', () => {
  it('renders language switcher button', () => {
    render(
      <AllProviders>
        <LanguageSwitcher />
      </AllProviders>
    );
    
    expect(screen.getByRole('button', { name: /change language/i })).toBeInTheDocument();
  });

  it('displays current language', () => {
    render(
      <AllProviders>
        <LanguageSwitcher />
      </AllProviders>
    );
    
    // Default language is Russian
    expect(screen.getByText('Русский')).toBeInTheDocument();
  });
});
