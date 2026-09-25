import '@testing-library/jest-dom'

// Mock import.meta.env for Supabase and API keys
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
      VITE_GROQ_API_KEY: 'gsk_test_key_placeholder',
    },
  },
})
