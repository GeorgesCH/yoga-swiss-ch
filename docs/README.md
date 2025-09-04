# YogaSwiss Documentation

This folder contains the complete documentation for the YogaSwiss platform - a world-class, full-feature alternative to Eversports, Mindbody, bsport & Arketa, optimized for Switzerland (CH) and EU.

## 📁 Folder Structure

### 01-architecture/
Core platform architecture and technical requirements
- **ARCHITECTURE.md** - High-level system architecture overview
- **yoga_swiss_platform_supabase_react_react_native_architecture_requirements_architecture.md** - Detailed technical architecture
- **GLOBAL_REQUIREMENTS_i18n_and_Supabase_20250902_070511.md** - Internationalization and Supabase requirements

### 02-core-modules/
Core business logic and feature specifications
- **Finance_Full_Requirements_and_Audit.md** - Financial system requirements
- **Marketing_Funnels_Campaigns_Leads_Full_Requirements.md** - Marketing automation system
- **Shop_Products_Pricing_Inventory_Full_Requirements.md** - E-commerce and inventory management
- **customers_full_requirements_and_spec.md** - Customer management system
- **registrations_full_requirements_and_spec.md** - Class registration system
- **classes_app_creation_management_flow.md** - Class management workflows
- **recurring_classes_management_rules.md** - Recurring class rules

### 03-admin-portal/
Administrative interface and management tools
- **Admin_Shell_and_Supabase_Integration_Status.md** - Admin shell and integration monitoring
- **Settings_Full_Requirements_and_Audit.md** - System settings and configuration
- **competitor_driven_feature_spec_and_task_breakdown_web_and_mobile.md** - Feature specifications

### 04-public-web/
Public-facing web application specifications
- *[Legacy specs moved to 08-legacy/]*

### 05-mobile-app/
Mobile application specifications
- *[Legacy specs moved to 08-legacy/]*

### 06-integrations/
Third-party integrations and APIs
- *[To be populated]*

### 07-deployment/
Deployment and infrastructure documentation
- **Supabase migration plan.pdf** - Database migration strategy

### 08-legacy/
Legacy documentation and specifications
- **YogaSwiss_*** - Various legacy specification folders
- **programs_retreats_specs_full/** - Programs and retreats specifications
- **retreats_programs/** - Retreat and program management
- **sis/** - System Integration Status (SIS) documentation

## 🎯 Key Features

- **Multi-tenant architecture** (Brand → Studio → Location)
- **Swiss localization** (de-CH, fr-CH tu, it-CH, en-CH)
- **Supabase integration** with RLS and real-time features
- **Swiss payment methods** (TWINT, QR-Bill, VAT compliance)
- **Comprehensive admin portal** with role-based access
- **Mobile-first design** with offline capabilities

## 🚀 Getting Started

1. Start with **01-architecture/ARCHITECTURE.md** for system overview
2. Review **02-core-modules/** for specific feature requirements
3. Check **03-admin-portal/** for administrative features
4. Reference **07-deployment/** for implementation guidance

## 📋 Documentation Standards

- All specifications include acceptance criteria
- RLS (Row-Level Security) requirements documented
- Multi-tenant isolation requirements specified
- Swiss compliance requirements (GDPR, nLPD, VAT) detailed

## 🔄 Maintenance

- Legacy documentation preserved in **08-legacy/**
- New specifications should follow the established structure
- ZIP files and duplicate content have been cleaned up
- System files (.DS_Store) removed

---

*Last updated: January 2025*
*Platform: YogaSwiss v1.0*
