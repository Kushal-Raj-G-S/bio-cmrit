-- ============================================================================
-- KRISHICHAKRA COMPLETE INTEGRATION - BIOBLOOM MERGER
-- ============================================================================
-- This script creates ALL required tables for the complete KrishiChakra system
-- Includes: profiles, field_batches, RAG system, rotation patterns, analytics
-- Run this in Supabase SQL Editor as a single script
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector; -- For RAG embeddings

-- ============================================================================
-- CORE USER TABLES - CREATE FIRST
-- ============================================================================

-- Profiles table - Farmer information (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  -- Primary Key (linked to Supabase auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  full_name TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  
  -- Farming Experience
  experience_years TEXT, -- '0-2', '3-5', '6-10', '11-20', '20+'
  
  -- Farm Details
  farm_name TEXT,
  farm_size TEXT, -- 'small', 'medium', 'large', 'commercial'
  primary_crops TEXT, -- Comma-separated: "Wheat, Rice, Cotton"
  
  -- Location
  city TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  
  -- Verification Status
  phone_verified BOOLEAN DEFAULT false,
  aadhaar_verified BOOLEAN DEFAULT false,
  aadhaar_last_4 TEXT, -- Store only last 4 digits for security
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Onboarding Status
  onboarding_complete BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0, -- Track which step user is on
  
  -- Educational Progress
  courses_completed INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  badges_earned TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field batches table - User agricultural fields
CREATE TABLE IF NOT EXISTS field_batches (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User Reference (linked to Supabase auth.users)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Field Information
  name TEXT NOT NULL,
  location TEXT,
  size DECIMAL(10, 2) NOT NULL, -- Size in hectares
  
  -- AI Recommendation Inputs (Required for crop rotation)
  soil_type TEXT NOT NULL,
  season TEXT NOT NULL,
  climate_zone TEXT,
  current_crop TEXT,
  
  -- Field Status
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('active', 'planning', 'fallow', 'harvested')),
  
  -- Optional Tracking
  planted_date TIMESTAMP WITH TIME ZONE,
  expected_harvest TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_batches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own field batches" ON field_batches;
DROP POLICY IF EXISTS "Users can insert own field batches" ON field_batches;
DROP POLICY IF EXISTS "Users can update own field batches" ON field_batches;
DROP POLICY IF EXISTS "Users can delete own field batches" ON field_batches;

-- Core table policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own field batches" ON field_batches
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own field batches" ON field_batches
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own field batches" ON field_batches
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own field batches" ON field_batches
    FOR DELETE USING (auth.uid() = user_id);

-- Core indexes
CREATE INDEX IF NOT EXISTS idx_field_batches_user_id ON field_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_field_batches_status ON field_batches(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- ============================================================================
-- KRISHICHAKRA SCHEMA - RAG SYSTEM NAMESPACE
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS krishichakra;

-- ============================================================================
-- RAG SYSTEM TABLES - KNOWLEDGE BASE
-- ============================================================================

-- Research papers table for RAG knowledge base
CREATE TABLE IF NOT EXISTS krishichakra.research_papers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content_chunk TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding vector(384), -- OpenAI/Sentence transformers embeddings
    source_url TEXT,
    publication_year INTEGER,
    authors TEXT[],
    keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop yield data table - Historical yield performance
CREATE TABLE IF NOT EXISTS krishichakra.crop_yields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    region TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    crop_name TEXT NOT NULL,
    variety TEXT,
    yield_kg_per_hectare DECIMAL(10,2),
    production_tonnes DECIMAL(15,2),
    area_hectares DECIMAL(15,2),
    year INTEGER NOT NULL,
    season TEXT, -- rabi, kharif, zaid
    soil_type TEXT,
    rainfall_mm DECIMAL(8,2),
    temperature_avg DECIMAL(5,2),
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop rotation patterns table - AI recommendations database
CREATE TABLE IF NOT EXISTS krishichakra.rotation_patterns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pattern_name TEXT NOT NULL,
    crops_sequence TEXT[] NOT NULL, -- ['Rice', 'Wheat', 'Sugarcane']
    duration_years INTEGER NOT NULL,
    suitable_regions TEXT[],
    soil_types TEXT[],
    benefits TEXT[],
    challenges TEXT[],
    success_rate DECIMAL(3,2), -- 0.00 to 1.00
    roi_percentage DECIMAL(5,2), -- Return on investment
    sustainability_score DECIMAL(3,2), -- Environmental impact
    water_efficiency DECIMAL(3,2),
    pest_resistance DECIMAL(3,2),
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market prices table - Real-time pricing data
CREATE TABLE IF NOT EXISTS krishichakra.market_prices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    crop_name TEXT NOT NULL,
    variety TEXT,
    region TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    market_name TEXT,
    price_per_quintal DECIMAL(10,2),
    price_date DATE NOT NULL,
    price_type TEXT CHECK (price_type IN ('min', 'max', 'modal', 'average')),
    quality_grade TEXT, -- 'A', 'B', 'C'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather data table - Climate information for recommendations
CREATE TABLE IF NOT EXISTS krishichakra.weather_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    region TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    humidity DECIMAL(5,2),
    rainfall_mm DECIMAL(8,2),
    wind_speed DECIMAL(5,2),
    weather_date DATE NOT NULL,
    season TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Soil analysis data - Detailed soil information
CREATE TABLE IF NOT EXISTS krishichakra.soil_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    region TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    soil_type TEXT NOT NULL,
    ph_level DECIMAL(3,2),
    organic_carbon DECIMAL(5,2),
    nitrogen DECIMAL(8,2),
    phosphorus DECIMAL(8,2),
    potassium DECIMAL(8,2),
    micronutrients JSONB, -- Store as JSON for flexibility
    texture TEXT, -- clay, loam, sandy, etc.
    drainage TEXT, -- good, moderate, poor
    analysis_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER DATA TABLES - ENHANCED FIELD MANAGEMENT
-- ============================================================================

-- Field management history - Track changes over time
CREATE TABLE IF NOT EXISTS field_batch_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    field_batch_id UUID NOT NULL REFERENCES field_batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'created', 'updated', 'planted', 'harvested'
    old_values JSONB,
    new_values JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crop rotation plans - Generated AI recommendations
CREATE TABLE IF NOT EXISTS crop_rotation_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_batch_id UUID NOT NULL REFERENCES field_batches(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    
    -- Input parameters used for generating plan
    input_params JSONB NOT NULL,
    
    -- Generated plan details
    plan_data JSONB NOT NULL, -- Complete rotation sequence with timings
    duration_years INTEGER NOT NULL,
    expected_roi DECIMAL(5,2),
    sustainability_score DECIMAL(3,2),
    
    -- Plan status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'abandoned')),
    activated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field activities - Track farming activities
CREATE TABLE IF NOT EXISTS field_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    field_batch_id UUID NOT NULL REFERENCES field_batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    activity_type TEXT NOT NULL, -- 'planting', 'irrigation', 'fertilizing', 'pest_control', 'harvesting'
    activity_date DATE NOT NULL,
    crop_involved TEXT,
    
    -- Activity details
    description TEXT,
    quantity DECIMAL(10,2),
    unit TEXT, -- kg, liters, bags, etc.
    cost DECIMAL(10,2),
    
    -- Location within field
    field_section TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Harvest records - Track yield and quality
CREATE TABLE IF NOT EXISTS harvest_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    field_batch_id UUID NOT NULL REFERENCES field_batches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    crop_name TEXT NOT NULL,
    variety TEXT,
    harvest_date DATE NOT NULL,
    
    -- Yield metrics
    quantity_kg DECIMAL(15,2) NOT NULL,
    area_harvested DECIMAL(10,2), -- hectares
    yield_per_hectare DECIMAL(10,2),
    
    -- Quality assessment
    quality_grade TEXT,
    moisture_content DECIMAL(5,2),
    
    -- Economic data
    sale_price_per_kg DECIMAL(10,2),
    total_revenue DECIMAL(15,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENHANCED INDEXES FOR PERFORMANCE
-- ============================================================================

-- Vector similarity search indexes (for RAG system)
CREATE INDEX IF NOT EXISTS idx_research_papers_embedding 
    ON krishichakra.research_papers USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_crop_yields_embedding 
    ON krishichakra.crop_yields USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_rotation_patterns_embedding 
    ON krishichakra.rotation_patterns USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Standard B-tree indexes for common queries
CREATE INDEX IF NOT EXISTS idx_crop_yields_region_crop_year 
    ON krishichakra.crop_yields(region, crop_name, year);

CREATE INDEX IF NOT EXISTS idx_market_prices_crop_region_date 
    ON krishichakra.market_prices(crop_name, region, price_date DESC);

CREATE INDEX IF NOT EXISTS idx_weather_data_region_date 
    ON krishichakra.weather_data(region, state, weather_date DESC);

CREATE INDEX IF NOT EXISTS idx_field_activities_field_date 
    ON field_activities(field_batch_id, activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_harvest_records_field_crop 
    ON harvest_records(field_batch_id, crop_name);

CREATE INDEX IF NOT EXISTS idx_rotation_plans_user_status 
    ON crop_rotation_plans(user_id, status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all user-related tables
ALTER TABLE field_batch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_rotation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_records ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own field history" ON field_batch_history;
DROP POLICY IF EXISTS "Users can insert own field history" ON field_batch_history;
DROP POLICY IF EXISTS "Users can view own rotation plans" ON crop_rotation_plans;
DROP POLICY IF EXISTS "Users can insert own rotation plans" ON crop_rotation_plans;
DROP POLICY IF EXISTS "Users can update own rotation plans" ON crop_rotation_plans;
DROP POLICY IF EXISTS "Users can delete own rotation plans" ON crop_rotation_plans;
DROP POLICY IF EXISTS "Users can view own field activities" ON field_activities;
DROP POLICY IF EXISTS "Users can insert own field activities" ON field_activities;
DROP POLICY IF EXISTS "Users can update own field activities" ON field_activities;
DROP POLICY IF EXISTS "Users can delete own field activities" ON field_activities;
DROP POLICY IF EXISTS "Users can view own harvest records" ON harvest_records;
DROP POLICY IF EXISTS "Users can insert own harvest records" ON harvest_records;
DROP POLICY IF EXISTS "Users can update own harvest records" ON harvest_records;
DROP POLICY IF EXISTS "Users can delete own harvest records" ON harvest_records;

-- Field batch history policies
CREATE POLICY "Users can view own field history" ON field_batch_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own field history" ON field_batch_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Crop rotation plans policies
CREATE POLICY "Users can view own rotation plans" ON crop_rotation_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rotation plans" ON crop_rotation_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rotation plans" ON crop_rotation_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rotation plans" ON crop_rotation_plans
    FOR DELETE USING (auth.uid() = user_id);

-- Field activities policies
CREATE POLICY "Users can view own field activities" ON field_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own field activities" ON field_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own field activities" ON field_activities
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own field activities" ON field_activities
    FOR DELETE USING (auth.uid() = user_id);

-- Harvest records policies
CREATE POLICY "Users can view own harvest records" ON harvest_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own harvest records" ON harvest_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own harvest records" ON harvest_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own harvest records" ON harvest_records
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist (to avoid conflicts)
DROP TRIGGER IF EXISTS update_rotation_plans_updated_at ON crop_rotation_plans;
DROP TRIGGER IF EXISTS update_research_papers_updated_at ON krishichakra.research_papers;

-- Trigger for crop_rotation_plans updated_at
CREATE TRIGGER update_rotation_plans_updated_at
    BEFORE UPDATE ON crop_rotation_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for research_papers updated_at
CREATE TRIGGER update_research_papers_updated_at
    BEFORE UPDATE ON krishichakra.research_papers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically log field batch changes
CREATE OR REPLACE FUNCTION log_field_batch_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the change in field_batch_history
    INSERT INTO field_batch_history (
        field_batch_id, 
        user_id, 
        action, 
        old_values, 
        new_values
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.user_id, OLD.user_id),
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'created'
            WHEN TG_OP = 'UPDATE' THEN 'updated'
            WHEN TG_OP = 'DELETE' THEN 'deleted'
        END,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS log_field_batch_changes_trigger ON field_batches;

-- Trigger to automatically log field batch changes
CREATE TRIGGER log_field_batch_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON field_batches
    FOR EACH ROW
    EXECUTE FUNCTION log_field_batch_changes();

-- ============================================================================
-- SAMPLE DATA FOR ROTATION PATTERNS (Indian Agriculture)
-- ============================================================================

INSERT INTO krishichakra.rotation_patterns 
    (pattern_name, crops_sequence, duration_years, suitable_regions, soil_types, benefits, challenges, success_rate, roi_percentage, sustainability_score, water_efficiency, pest_resistance) 
VALUES
    ('Rice-Wheat-Sugarcane System', 
     ARRAY['Rice', 'Wheat', 'Sugarcane'], 
     3, 
     ARRAY['Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar'], 
     ARRAY['clay', 'loam', 'alluvial'], 
     ARRAY['High water use efficiency', 'Nitrogen fixation', 'Pest control', 'Soil fertility improvement'], 
     ARRAY['High water requirement', 'Labor intensive', 'Market price volatility'], 
     0.85, 18.5, 0.75, 0.80, 0.85),
    
    ('Cotton-Wheat-Maize Rotation', 
     ARRAY['Cotton', 'Wheat', 'Maize'], 
     3, 
     ARRAY['Gujarat', 'Maharashtra', 'Punjab', 'Rajasthan'], 
     ARRAY['black', 'clay', 'loam'], 
     ARRAY['Soil structure improvement', 'Diverse income streams', 'Risk distribution', 'Pest break cycle'], 
     ARRAY['Pest management complexity', 'Market volatility', 'Input cost variation'], 
     0.80, 22.3, 0.70, 0.75, 0.80),
    
    ('Soybean-Wheat-Rice System', 
     ARRAY['Soybean', 'Wheat', 'Rice'], 
     3, 
     ARRAY['Madhya Pradesh', 'Rajasthan', 'Maharashtra', 'Chhattisgarh'], 
     ARRAY['clay', 'sandy loam', 'black'], 
     ARRAY['Nitrogen fixation', 'Improved soil fertility', 'High protein crop income', 'Water management flexibility'], 
     ARRAY['Weather dependency', 'Storage requirements', 'Processing infrastructure need'], 
     0.88, 20.1, 0.85, 0.85, 0.75),
     
    ('Groundnut-Jowar-Cotton', 
     ARRAY['Groundnut', 'Jowar', 'Cotton'], 
     3, 
     ARRAY['Karnataka', 'Andhra Pradesh', 'Tamil Nadu', 'Gujarat'], 
     ARRAY['red', 'sandy', 'loam'], 
     ARRAY['Drought tolerance', 'Soil health improvement', 'Multiple income sources'], 
     ARRAY['Market access', 'Weather risk', 'Pest management'], 
     0.75, 19.8, 0.80, 0.90, 0.70),
     
    ('Mustard-Rice-Vegetables', 
     ARRAY['Mustard', 'Rice', 'Mixed Vegetables'], 
     2, 
     ARRAY['West Bengal', 'Assam', 'Bihar', 'Jharkhand'], 
     ARRAY['alluvial', 'clay', 'loam'], 
     ARRAY['Year-round income', 'Nutritional diversity', 'Local market access'], 
     ARRAY['Labor intensive', 'Perishability', 'Market fluctuation'], 
     0.82, 25.5, 0.90, 0.80, 0.85)
ON CONFLICT DO NOTHING;

-- Sample crop yield data
INSERT INTO krishichakra.crop_yields 
    (region, state, district, crop_name, variety, yield_kg_per_hectare, year, season, soil_type, rainfall_mm)
VALUES
    ('North India', 'Punjab', 'Ludhiana', 'Rice', 'Basmati 1121', 4500, 2023, 'kharif', 'alluvial', 650),
    ('North India', 'Punjab', 'Ludhiana', 'Wheat', 'PBW 725', 5200, 2024, 'rabi', 'alluvial', 300),
    ('West India', 'Gujarat', 'Ahmedabad', 'Cotton', 'Bt Cotton', 2800, 2023, 'kharif', 'black', 400),
    ('Central India', 'Madhya Pradesh', 'Indore', 'Soybean', 'JS 335', 2200, 2023, 'kharif', 'black', 800),
    ('South India', 'Tamil Nadu', 'Coimbatore', 'Sugarcane', 'Co 86032', 85000, 2023, 'annual', 'red', 1200)
ON CONFLICT DO NOTHING;

-- Sample market prices
INSERT INTO krishichakra.market_prices 
    (crop_name, variety, region, state, district, market_name, price_per_quintal, price_date, price_type)
VALUES
    ('Rice', 'Basmati', 'North India', 'Punjab', 'Ludhiana', 'Ludhiana Mandi', 3500, CURRENT_DATE, 'modal'),
    ('Wheat', 'HD 2967', 'North India', 'Punjab', 'Ludhiana', 'Ludhiana Mandi', 2250, CURRENT_DATE, 'modal'),
    ('Cotton', 'Bt Cotton', 'West India', 'Gujarat', 'Ahmedabad', 'Ahmedabad APMC', 6800, CURRENT_DATE, 'modal'),
    ('Soybean', 'JS 335', 'Central India', 'Madhya Pradesh', 'Indore', 'Indore Mandi', 4200, CURRENT_DATE, 'modal')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VIEWS FOR EASY DATA ACCESS
-- ============================================================================

-- View for complete field information with latest rotation plan
CREATE OR REPLACE VIEW field_dashboard AS
SELECT 
    fb.*,
    p.full_name as farmer_name,
    p.phone as farmer_phone,
    p.state as farmer_state,
    crp.plan_name as active_plan_name,
    crp.expected_roi,
    crp.sustainability_score,
    COUNT(fa.id) as total_activities,
    COUNT(hr.id) as total_harvests
FROM field_batches fb
LEFT JOIN profiles p ON fb.user_id = p.id
LEFT JOIN crop_rotation_plans crp ON fb.id = crp.field_batch_id AND crp.status = 'active'
LEFT JOIN field_activities fa ON fb.id = fa.field_batch_id
LEFT JOIN harvest_records hr ON fb.id = hr.field_batch_id
GROUP BY fb.id, p.full_name, p.phone, p.state, crp.plan_name, crp.expected_roi, crp.sustainability_score;

-- View for rotation recommendations based on location and soil
CREATE OR REPLACE VIEW rotation_recommendations AS
SELECT 
    rp.*,
    CASE 
        WHEN rp.success_rate >= 0.85 THEN 'Highly Recommended'
        WHEN rp.success_rate >= 0.75 THEN 'Recommended'
        ELSE 'Consider with Caution'
    END as recommendation_level
FROM krishichakra.rotation_patterns rp
ORDER BY rp.success_rate DESC, rp.roi_percentage DESC;

-- ============================================================================
-- FUNCTIONS FOR APPLICATION LOGIC
-- ============================================================================

-- Function to get rotation recommendations for a specific field
CREATE OR REPLACE FUNCTION get_rotation_recommendations(
    p_soil_type TEXT,
    p_region TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    pattern_name TEXT,
    crops_sequence TEXT[],
    duration_years INTEGER,
    benefits TEXT[],
    success_rate DECIMAL,
    roi_percentage DECIMAL,
    sustainability_score DECIMAL,
    recommendation_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rp.id,
        rp.pattern_name,
        rp.crops_sequence,
        rp.duration_years,
        rp.benefits,
        rp.success_rate,
        rp.roi_percentage,
        rp.sustainability_score,
        CASE 
            WHEN rp.success_rate >= 0.85 THEN 'Highly Recommended'::TEXT
            WHEN rp.success_rate >= 0.75 THEN 'Recommended'::TEXT
            ELSE 'Consider with Caution'::TEXT
        END as recommendation_level
    FROM krishichakra.rotation_patterns rp
    WHERE p_soil_type = ANY(rp.soil_types)
      AND (p_region IS NULL OR p_region = ANY(rp.suitable_regions))
      AND (p_state IS NULL OR p_state = ANY(rp.suitable_regions))
    ORDER BY rp.success_rate DESC, rp.roi_percentage DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Create a simple function to verify the migration
CREATE OR REPLACE FUNCTION verify_krishichakra_migration()
RETURNS TEXT AS $$
DECLARE
    table_count INTEGER;
    schema_exists BOOLEAN;
BEGIN
    -- Check if krishichakra schema exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = 'krishichakra'
    ) INTO schema_exists;
    
    -- Count KrishiChakra related tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema IN ('public', 'krishichakra')
    AND table_name IN (
        'field_batches', 'crop_rotation_plans', 'field_activities', 
        'harvest_records', 'research_papers', 'crop_yields', 
        'rotation_patterns', 'market_prices'
    );
    
    RETURN 'KrishiChakra Migration Status: ' || 
           CASE WHEN schema_exists THEN 'Schema Created ✓' ELSE 'Schema Missing ✗' END ||
           ' | Tables Found: ' || table_count || '/8';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON SCHEMA krishichakra IS 'KrishiChakra RAG system and analytics tables';
COMMENT ON TABLE field_batches IS 'User agricultural fields with crop rotation capability';
COMMENT ON TABLE krishichakra.rotation_patterns IS 'AI-powered crop rotation recommendations database';
COMMENT ON TABLE krishichakra.research_papers IS 'Research knowledge base for RAG system';
COMMENT ON TABLE crop_rotation_plans IS 'User-generated crop rotation plans from AI recommendations';
COMMENT ON TABLE field_activities IS 'Farming activities tracking for profit/loss analysis';
COMMENT ON TABLE harvest_records IS 'Harvest yield and quality tracking';

-- Run verification
SELECT verify_krishichakra_migration();