# YogaSwiss Cancellation & Refund System Guide

## Overview

The YogaSwiss platform includes a comprehensive cancellation and refund management system that handles all scenarios involving class cancellations, customer refunds, and credit management. This system is designed specifically for Swiss yoga studios with local payment methods, currency formatting, and business practices.

## Key Features

### 1. Multi-Party Cancellation Support
- **Customer Cancellations**: When customers cancel their bookings
- **Instructor Cancellations**: When instructors cannot teach classes
- **Studio Cancellations**: When the studio needs to cancel classes
- **Weather Cancellations**: For outdoor classes affected by weather
- **Emergency Cancellations**: For urgent situations

### 2. Flexible Refund Policies
- **Sliding Scale Refunds**: Different refund percentages based on cancellation timing
- **Credit System**: Partial or full credits to customer wallets
- **Processing Fees**: Configurable fees for different scenarios
- **Swiss Payment Methods**: Support for TWINT, QR-bill, and standard payments

### 3. Automated Processing
- **Real-time Notifications**: Automatic customer and instructor notifications
- **Waitlist Management**: Automatic promotion from waitlist when spots open
- **Financial Reconciliation**: Automatic refund processing and credit allocation

## System Components

### CancellationRefundSystem.tsx
Main component for managing all cancellation requests and policies.

**Key Features:**
- Cancellation request management
- Policy configuration
- Analytics and reporting
- Bulk operations support

### SupabaseIntegrationService.tsx
Backend integration service for all database operations.

**Key Functions:**
- `cancelClassOccurrence()`: Cancel classes with automatic refund processing
- `processAutomaticRefund()`: Handle refund calculations and processing
- `addWalletCredit()`: Add credits to customer wallets
- `deductWalletCredit()`: Deduct from customer wallets

### CustomerWalletManager.tsx
Comprehensive wallet management for customer credits and transactions.

**Features:**
- Wallet balance tracking
- Transaction history
- Manual credit adjustments
- Bulk operations

## Cancellation Policies

### Standard Class Cancellation Policy
```typescript
{
  24+ hours before: 100% refund, no processing fee
  12-24 hours before: 50% refund + 50% credit, CHF 2.50 fee
  2-12 hours before: 100% credit, CHF 2.50 fee
  Less than 2 hours: No refund or credit
}
```

### Instructor/Weather/Emergency Cancellations
```typescript
{
  Any time: 100% refund, no processing fee
  Automatic customer notification
  Waitlist notification for alternative classes
}
```

### Swiss-Specific Features
- All currency displayed in CHF format
- TWINT payment integration
- QR-bill invoice generation
- Swiss date/time formatting
- Multi-language support (DE/FR/IT/EN)

## Database Schema

### Core Tables
1. **class_occurrences**: Class instances with booking counts
2. **registrations**: Customer bookings with payment status
3. **wallets**: Customer wallet balances
4. **wallet_transactions**: Transaction history
5. **orders**: Payment and refund records

### Stored Procedures
- `add_wallet_credit()`: Atomic wallet credit operations
- `deduct_wallet_credit()`: Atomic wallet debit operations
- `create_booking_transaction()`: Complete booking process
- `use_pass_credit()`: Pass/membership credit usage
- `get_cancellation_analytics()`: Reporting functions

## Workflow Examples

### Customer Cancellation (12 hours before class)
1. Customer requests cancellation
2. System calculates refund: 50% refund + 50% credit - CHF 2.50 fee
3. Payment refund processed to original method
4. Credit added to customer wallet
5. Registration status updated to 'cancelled'
6. Class booking count decremented
7. Waitlist customers notified of available spot

### Instructor Cancellation (Emergency)
1. Instructor/manager cancels class
2. System processes 100% refunds for all customers
3. Automatic notifications sent to all affected customers
4. Class status updated to 'cancelled'
5. Instructor pay adjustments processed
6. Analytics updated

### Weather Cancellation (Outdoor Class)
1. System monitors weather conditions
2. Automatic cancellation triggered for unsafe conditions
3. All customers receive full refunds
4. Alternative indoor class suggestions sent
5. Instructor notified of cancellation

## Integration Points

### Supabase Real-time Features
- Live updates for class cancellations
- Real-time wallet balance updates
- Instant notification delivery

### Payment Processing
- Stripe integration for card refunds
- TWINT API for mobile payment refunds
- QR-bill generation for Swiss bank transfers

### Notification System
- Email notifications
- SMS alerts (Swiss providers)
- In-app push notifications
- WhatsApp integration (optional)

## Analytics and Reporting

### Key Metrics
- Cancellation rates by type
- Average refund amounts
- Customer satisfaction scores
- Financial impact analysis
- Peak cancellation times

### Dashboard Features
- Real-time cancellation monitoring
- Refund processing status
- Customer wallet overview
- Policy effectiveness analysis

## Configuration Options

### Cancellation Policies
- Customizable time windows
- Flexible refund percentages
- Configurable processing fees
- Class-type specific rules

### Notification Templates
- Multi-language message templates
- Customizable notification timing
- Brand-specific messaging
- Emergency alert templates

## Best Practices

### For Studio Managers
1. Set clear cancellation policies
2. Monitor cancellation patterns
3. Communicate policy changes clearly
4. Handle emergency cancellations promptly

### For Customers
1. Cancel as early as possible
2. Check refund policies before booking
3. Use wallet credits efficiently
4. Update contact information for notifications

### For Instructors
1. Notify studio immediately of cancellations
2. Provide alternative class suggestions
3. Maintain professional communication
4. Follow studio cancellation procedures

## Technical Implementation

### Key Dependencies
- Supabase for database operations
- Stripe for payment processing
- React Query for state management
- Tailwind CSS for styling

### Performance Considerations
- Batch processing for bulk operations
- Indexed database queries
- Cached policy calculations
- Async notification processing

### Security Measures
- Row-level security policies
- Audit trail for all transactions
- Encrypted payment data
- Role-based access control

## Future Enhancements

### Planned Features
- AI-powered cancellation prediction
- Dynamic pricing based on cancellation risk
- Integration with weather APIs
- Advanced analytics dashboard

### Swiss Market Specific
- Integration with local payment providers
- Compliance with Swiss data protection laws
- Multi-canton tax handling
- Integration with Swiss health insurance

## Support and Maintenance

### Monitoring
- Transaction failure alerts
- Policy compliance checking
- Customer satisfaction tracking
- System performance monitoring

### Regular Reviews
- Policy effectiveness analysis
- Customer feedback integration
- Financial impact assessment
- System optimization recommendations

This comprehensive system ensures that YogaSwiss can handle all cancellation scenarios professionally while maintaining customer satisfaction and financial integrity.