
-- Quick verification query - run this after migration
SELECT 
    'Migration Successful! 🎉' as status,
    verify_krishichakra_migration() as details;

-- Check if sample data was loaded
SELECT 
    COUNT(*) as rotation_patterns_count,
    'Sample rotation patterns loaded' as note
FROM krishichakra.rotation_patterns;

-- Verify user can create field batches
SELECT 
    'Ready to store field batches!' as message,
    COUNT(*) as existing_fields
FROM field_batches;
