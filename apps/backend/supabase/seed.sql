-- ===========================================
-- Seed Data for Development
-- ===========================================

-- Note: This seed file is for development purposes only.
-- In production, users will be created through the auth system.

-- Create a test user (requires running supabase auth admin createUser command)
-- For local development, you can create users through the Supabase Studio UI.

-- Example seed data for a test user's jobs (uncomment and modify as needed):
/*
-- First, ensure a test user exists with this ID (create through auth)
-- Then add sample jobs:

INSERT INTO public.jobs (user_id, photo_url, inputs, outputs)
VALUES
    (
        'YOUR-TEST-USER-UUID-HERE',
        NULL,
        '{
            "jobType": "Brickwork",
            "anchorType": "length",
            "anchorValue": 4.5,
            "difficulty": "Standard",
            "hasOpenings": true
        }'::jsonb,
        '{
            "area_m2": 12.5,
            "brick_count_range": [650, 850],
            "materials": {
                "sand_kg_range": [700, 900],
                "cement_bags_range": [5, 7],
                "other": ["Scaffolding may be required"]
            },
            "labour_hours_range": [16, 24],
            "recommended_price_gbp_range": [1200, 1800],
            "assumptions": [
                "Standard brick size (215x102.5x65mm)",
                "Stretcher bond pattern",
                "Good ground access"
            ],
            "exclusions": [
                "Scaffolding",
                "Skip hire",
                "Foundation work"
            ],
            "notes": [
                "Consider weather conditions for timing"
            ]
        }'::jsonb
    ),
    (
        'YOUR-TEST-USER-UUID-HERE',
        NULL,
        '{
            "jobType": "Repointing",
            "anchorType": "height",
            "anchorValue": 3.0,
            "difficulty": "Tricky",
            "hasOpenings": false
        }'::jsonb,
        '{
            "area_m2": 8.0,
            "brick_count_range": [0, 0],
            "materials": {
                "sand_kg_range": [200, 300],
                "cement_bags_range": [2, 3],
                "other": ["Lime putty", "Pointing tools"]
            },
            "labour_hours_range": [20, 28],
            "recommended_price_gbp_range": [800, 1100],
            "assumptions": [
                "Mortar joints need full replacement",
                "Standard joint depth"
            ],
            "exclusions": [
                "Brick replacement",
                "Scaffolding"
            ],
            "notes": [
                "Weather dependent - avoid frost"
            ]
        }'::jsonb
    );
*/

-- Verification query (useful for testing)
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.jobs;
