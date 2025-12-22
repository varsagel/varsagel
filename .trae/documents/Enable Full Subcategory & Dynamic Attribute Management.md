I will fix the "Category Management" and "Dynamic Form Building" issues by enabling full subcategory support and allowing attributes to be specific to subcategories (e.g., adding "Fuel Type" only for "Automobiles").

### **Plan of Action**

1.  **Database Schema Update (`prisma/schema.prisma`)**:
    *   Update `CategoryAttribute` model to include an optional `subCategoryId` field.
    *   This allows attributes to be linked either to a main `Category` (global for that category) OR a specific `SubCategory`.

2.  **API Implementation**:
    *   **Create Subcategory APIs**:
        *   `POST /api/admin/subcategories`: To create new subcategories.
        *   `DELETE /api/admin/subcategories/[id]`: To delete subcategories.
    *   **Update Attribute APIs**:
        *   Update `POST /api/admin/attributes` to accept `subCategoryId`.
        *   Update `GET` logic (in categories endpoint) to fetch attributes correctly structured by subcategory.

3.  **Admin Panel UI Updates (`admin/kategoriler/[id]/page.tsx`)**:
    *   **"Subcategories" Tab**: Implement a real list where you can:
        *   View existing subcategories.
        *   Add a new subcategory (Name & Slug).
        *   Delete a subcategory.
    *   **"Attributes" Tab**:
        *   Add a "Target Subcategory" dropdown when creating a new attribute.
        *   This will allow you to say: "Add 'Gearbox Type' field ONLY for 'Automobile' subcategory".

4.  **Frontend Form Integration (`TalepForm.tsx`)**:
    *   Update the logic to filter and display attributes based on the *selected subcategory* in addition to the main category.

This will give you the granular control you requested (e.g., editing forms specifically for "Automobiles" under "Vehicles").