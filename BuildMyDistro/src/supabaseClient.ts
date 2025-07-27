import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ezhoyyyrsuksjwuufsrz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6aG95eXlyc3Vrc2p3dXVmc3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODQ1NTgsImV4cCI6MjA2OTE2MDU1OH0.EMUWFgBHW5u6VaUJj4GfpLRrM_gX_qhTIwCC3a1-JOM'
);