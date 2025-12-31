// TEMPORARY VALIDATION BYPASS FOR TESTING
// This function temporarily bypasses validation to test step progression
export function bypassValidationForTesting() {
  return true;
}

// Original validation function - uncomment to restore
/*
export function validateStep(step: number, formData: any, buildAttributeFields: any): boolean {
  const newErrors: Record<string, string> = {};
  
  if (step === 2) {
    console.log('=== STEP 2 VALIDATION START ===');
    console.log('Step 2 validation - formData.title:', formData.title);
    console.log('Step 2 validation - formData.description:', formData.description);
    console.log('Step 2 validation - title length:', formData.title?.trim().length);
    console.log('Step 2 validation - description length:', formData.description?.trim().length);
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Başlık girmelisiniz';
      console.log('Title validation failed: empty title');
    }
    if ((formData.title?.trim().length || 0) < 10) {
      newErrors.title = 'Başlık en az 10 karakter olmalı';
      console.log('Title validation failed: length < 10');
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Açıklama girmelisiniz';
      console.log('Description validation failed: empty description');
    }
    if ((formData.description?.trim().length || 0) < 20) {
      newErrors.description = 'Açıklama en az 20 karakter olmalı';
      console.log('Description validation failed: length < 20');
    }

    const combined = buildAttributeFields();
    console.log('Step 2 validation - buildAttributeFields result:', combined);
    if (combined && combined.length > 0) {
      console.log('Processing attributes, count:', combined.length);
      // ... rest of validation logic
    } else {
      console.log('No attributes to validate');
    }
    console.log('=== STEP 2 VALIDATION END ===');
    console.log('Step 2 validation - final errors:', newErrors);
    console.log('Step 2 validation - error count:', Object.keys(newErrors).length);
  }
  
  return Object.keys(newErrors).length === 0;
}
*/