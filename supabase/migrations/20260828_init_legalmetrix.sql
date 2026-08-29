-- ==============================================================================
-- LegalMetrix - Legal Metrology Compliance Inspection Database Schema
-- Compatible with PostgreSQL & Supabase
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INSPECTIONS TABLE
CREATE TABLE IF NOT EXISTS inspections (
    id VARCHAR(64) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    brand_or_mfg VARCHAR(255),
    category VARCHAR(100) NOT NULL DEFAULT 'General Packaged Commodities',
    batch_number VARCHAR(100),
    image_url TEXT,
    image_filename VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- 'COMPLIANT', 'NON-COMPLIANT', 'REVIEW REQUIRED'
    score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    violations_count INT NOT NULL DEFAULT 0,
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    confirmed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    evaluation JSONB NOT NULL DEFAULT '{}'::jsonb,
    notes TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes on inspections
CREATE INDEX IF NOT EXISTS idx_inspections_product_name ON inspections(product_name);
CREATE INDEX IF NOT EXISTS idx_inspections_category ON inspections(category);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_score ON inspections(score);
CREATE INDEX IF NOT EXISTS idx_inspections_created_at ON inspections(created_at DESC);

-- 2. PRODUCTS TABLE (Aggregated view of unique commodities inspected)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(255) UNIQUE NOT NULL,
    manufacturer VARCHAR(255),
    category VARCHAR(100) NOT NULL DEFAULT 'General Packaged Commodities',
    product_code VARCHAR(100),
    total_inspections INT NOT NULL DEFAULT 1,
    latest_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    latest_status VARCHAR(50) NOT NULL,
    last_inspected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(latest_status);

-- 3. COMPLIANCE RULES CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS compliance_rules (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    applicable_categories JSONB NOT NULL DEFAULT '["ALL"]'::jsonb,
    required_field VARCHAR(100),
    severity VARCHAR(20) NOT NULL DEFAULT 'Major', -- 'Critical', 'Major', 'Minor'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    legal_reference VARCHAR(255) NOT NULL,
    recommendation_template TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_rules_active ON compliance_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_category ON compliance_rules(category);

-- 4. STORAGE BUCKET (Supabase Storage setup statement)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('package-labels', 'package-labels', true)
ON CONFLICT (id) DO NOTHING;

-- Storage security policy for public reading of inspection label images
CREATE POLICY "Public Label Image Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'package-labels');

CREATE POLICY "Allow Uploads to Package Labels" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'package-labels');
