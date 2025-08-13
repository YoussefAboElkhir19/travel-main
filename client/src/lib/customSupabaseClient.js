import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://derwcdbagxuweuungiqt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcndjZGJhZ3h1d2V1dW5naXF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MzA3MTUsImV4cCI6MjA2OTMwNjcxNX0.GhkMO8TLyyjNCnRthqOuVrm0UkwTpoTrb232P1YnMN8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);