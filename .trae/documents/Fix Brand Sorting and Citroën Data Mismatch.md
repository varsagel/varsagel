I have addressed the reported issues regarding brand sorting and missing Citroën data.

### Fixes Implemented:
1.  **Brand Sorting ("Markalarda sıralanmamış"):**
    *   The issue was likely due to the application using dynamic data from the database which might be unsorted, ignoring my previous static config changes.
    *   **Solution:** I modified `src/app/talep-olustur/TalepForm.tsx` to **force sort** the brand list alphabetically in the frontend. This ensures brands are always sorted (A-Z, with Turkish character support) regardless of the data source.

2.  **Citroën Data & Mismatch ("Citroen" vs "Citroën"):**
    *   I found a mismatch where the brand was listed as "Citroën" (with diacritic) in the dropdown, but the extra data (Models/Series/Trims) I added was keyed under "Citroen" (without diacritic). This caused the detailed data (C3 Aircross, C5 Aircross, etc.) to not appear.
    *   **Solution:** I renamed all occurrences of "Citroen" to "Citroën" in `src/data/extra-vehicle-details.ts` to match the system's brand name.

### Verification:
*   **Sorting:** The frontend now explicitly sorts the 'marka' options using `localeCompare('tr')`.
*   **Data:** The keys in `extra-vehicle-details.ts` now match the brand name "Citroën", ensuring the custom models/trims are correctly loaded.

### Action Required:
*   Since you mentioned you already deployed ("deploy yaptım"), **you must deploy again** to apply these new fixes to the live site. The changes are currently only on your local codebase.
