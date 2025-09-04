# Scalable Events & Registrations System - Deployment Guide

## Overview

This guide covers the deployment of a high-scale events and registrations system built on Supabase, designed to handle 20k+ events/day and peak loads of 200-500 bookings/sec, similar to Eversports/Mindbody/Arketa.

## Architecture Summary

- **Series + Events Model**: Replaces fragmented classes/instances with scalable recurring definitions
- **Partitioned Tables**: Monthly partitions for `class_events` to handle large volumes
- **Atomic RPCs**: Idempotent booking/cancel flows with capacity enforcement
- **Edge Functions**: Handle payments, webhooks, waitlist, generation, and notifications
- **Materialized Views**: Fast reads via denormalized data
- **pg_cron Jobs**: Automated tasks for generation, promotion, cleanup
- **Comprehensive Monitoring**: Performance metrics, health checks, alerting

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure these environment variables are set in your Supabase project:

```bash
# Core Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment Processing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWINT_API_KEY=your_twint_key (optional)

# Email Service Provider
ESP_API_KEY=your_email_provider_key

# Security
CRON_SECRET=your_secure_cron_secret
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Rate Limiting (optional - Redis)
REDIS_URL=redis://your_redis_instance
```

### 2. Database Extensions

Verify these extensions are enabled:
- `uuid-ossp`
- `pgcrypto` 
- `ltree`
- `pg_cron`

### 3. Backup Current Data

```sql
-- Export existing data before migration
COPY (SELECT * FROM class_instances) TO '/tmp/class_instances_backup.csv' CSV HEADER;
COPY (SELECT * FROM class_registrations) TO '/tmp/registrations_backup.csv' CSV HEADER;
COPY (SELECT * FROM waitlists) TO '/tmp/waitlists_backup.csv' CSV HEADER;
```

## Deployment Steps

### Step 1: Apply Database Migrations

Apply migrations in order:

```bash
# 1. Core scalable data model with partitions
supabase db push --file supabase/migrations/20250904000001_scalable_events_system.sql

# 2. Core booking RPCs
supabase db push --file supabase/migrations/20250904000002_core_booking_rpcs.sql

# 3. Materialized views and caching
supabase db push --file supabase/migrations/20250904000003_materialized_views_caching.sql

# 4. pg_cron jobs
supabase db push --file supabase/migrations/20250904000004_pg_cron_jobs.sql

# 5. Observability and monitoring
supabase db push --file supabase/migrations/20250904000005_observability_monitoring.sql
```

### Step 2: Deploy Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy book
supabase functions deploy cancel
supabase functions deploy waitlist-promote
supabase functions deploy events-generate
supabase functions deploy webhooks-stripe

# Set environment variables for functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set CRON_SECRET=your_secure_secret
supabase secrets set ESP_API_KEY=your_email_key
```

### Step 3: Data Migration

Run the data migration to convert existing data:

```sql
-- Migrate existing data to new model
SELECT public.migrate_class_instances_to_events();

-- Verify migration
SELECT 
  'class_series' as table_name, count(*) as count FROM public.class_series
UNION ALL
SELECT 
  'class_events' as table_name, count(*) as count FROM public.class_events
UNION ALL
SELECT 
  'registrations' as table_name, count(*) as count FROM public.registrations;
```

### Step 4: Initialize Materialized Views

```sql
-- Initial refresh of all materialized views
SELECT public.refresh_all_materialized_views();

-- Verify views are populated
SELECT count(*) FROM public.event_search_mv;
SELECT count(*) FROM public.customer_dashboard_mv;
SELECT count(*) FROM public.instructor_schedule_mv;
SELECT count(*) FROM public.org_analytics_mv;
```

### Step 5: Verify Cron Jobs

```sql
-- Check cron jobs are scheduled
SELECT public.get_cron_job_status();

-- Verify job execution
SELECT public.get_cron_job_history(24);
```

### Step 6: Generate Initial Events

```sql
-- Generate events for next 120 days
SELECT public.generate_events_for_all(CURRENT_DATE + interval '120 days');
```

## Post-Deployment Verification

### 1. Health Checks

```sql
-- Run system health checks
SELECT public.health_check_database();
SELECT public.health_check_booking_system();
SELECT public.get_system_health_summary();
```

### 2. Performance Testing

```sql
-- Run load test with 50 concurrent bookings
SELECT public.simulate_booking_load(50, 60);

-- Check performance metrics
SELECT public.get_booking_performance_summary();
```

### 3. Booking Flow Test

Test the complete booking flow:

```bash
# Test booking API
curl -X POST https://your-project.supabase.co/functions/v1/book \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-$(date +%s)" \
  -d '{
    "eventId": "your-test-event-id",
    "customerId": "your-test-customer-id",
    "paymentMethod": "stripe"
  }'
```

### 4. Webhook Testing

```bash
# Test Stripe webhook endpoint
curl -X POST https://your-project.supabase.co/functions/v1/webhooks-stripe \
  -H "stripe-signature: test-signature" \
  -H "Content-Type: application/json" \
  -d '{"type": "payment_intent.succeeded", "data": {"object": {"id": "pi_test"}}}'
```

## Monitoring Setup

### 1. Dashboard Queries

Key metrics to monitor:

```sql
-- Booking performance (last 24h)
SELECT 
  tags->>'operation' as operation,
  AVG(metric_value) as avg_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95_ms,
  COUNT(*) as count
FROM public.performance_metrics 
WHERE metric_name = 'booking_operation_duration'
  AND recorded_at > now() - interval '24 hours'
GROUP BY tags->>'operation';

-- Active alerts
SELECT * FROM public.active_alerts;

-- System health
SELECT public.get_system_health_summary();
```

### 2. Alert Configuration

Configure alerts for:
- Booking response time > 2s (warning), > 5s (critical)
- Database response time > 500ms (warning), > 1s (critical)
- High error rates
- Waitlist processing delays
- Partition maintenance failures

### 3. Grafana/Monitoring Integration

Connect to `public.performance_metrics` and `public.health_checks` tables for:
- Real-time dashboards
- Historical trend analysis
- Capacity planning metrics

## Performance Optimization

### 1. Connection Pooling

Configure connection pooling for high concurrency:
- Use Supabase's built-in pooler
- Set appropriate pool sizes based on load

### 2. Read Replicas

For high read loads:
- Route search queries to read replicas
- Keep writes on primary
- Use materialized views for heavy analytics

### 3. Edge Caching

Implement edge caching for:
- Public event listings (30-60s TTL)
- Location/instructor data (5min TTL)
- Organization branding (1hr TTL)

### 4. Database Tuning

```sql
-- Optimize for high concurrency
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Reload configuration
SELECT pg_reload_conf();
```

## Scaling Considerations

### 1. Horizontal Scaling

- **Read Replicas**: Scale read operations
- **Connection Pooling**: Handle more concurrent connections
- **Edge Functions**: Auto-scale with demand

### 2. Partition Management

- **Automated Partition Creation**: Via cron jobs
- **Partition Pruning**: Archive old partitions
- **Index Maintenance**: Ensure indexes exist on all partitions

### 3. Capacity Planning

Monitor these metrics for scaling decisions:
- Database CPU/Memory usage
- Connection pool utilization
- Edge Function execution time
- Storage growth rate

## Troubleshooting

### Common Issues

1. **Booking Failures**
   - Check event capacity and status
   - Verify user permissions
   - Review rate limiting

2. **Slow Performance**
   - Check materialized view freshness
   - Verify partition pruning
   - Review query plans

3. **Cron Job Failures**
   - Check job status: `SELECT public.get_cron_job_status()`
   - Review error logs
   - Verify permissions

4. **Webhook Issues**
   - Verify signature validation
   - Check endpoint accessibility
   - Review payload format

### Debug Queries

```sql
-- Check partition distribution
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename LIKE 'class_events_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check booking conflicts
SELECT 
  event_id,
  count(*) as registration_count,
  capacity,
  reg_count
FROM public.registrations r
JOIN public.class_events e ON e.id = r.event_id
WHERE r.status = 'confirmed'
GROUP BY event_id, capacity, reg_count
HAVING count(*) != reg_count;

-- Check waitlist processing
SELECT 
  event_id,
  count(*) as waitlist_size,
  count(*) FILTER (WHERE promoted_at IS NOT NULL) as promoted_count
FROM public.event_waitlists
GROUP BY event_id
ORDER BY waitlist_size DESC;
```

## Rollback Plan

If issues arise, rollback steps:

1. **Disable New Features**
   ```sql
   -- Disable cron jobs
   SELECT cron.unschedule('events_generate_daily');
   SELECT cron.unschedule('waitlist_promote_minute');
   ```

2. **Revert to Old Tables**
   ```sql
   -- Switch application to use old tables temporarily
   -- Update application configuration
   ```

3. **Data Recovery**
   ```sql
   -- Restore from backups if needed
   COPY class_instances FROM '/tmp/class_instances_backup.csv' CSV HEADER;
   ```

## Success Metrics

Track these KPIs post-deployment:

- **Performance**: Booking API p95 < 300ms
- **Reliability**: 99.9% uptime, no overbooking incidents
- **Scale**: Handle target load (200-500 bookings/sec)
- **User Experience**: Waitlist promotion < 5min, email delivery < 30s

## Support Contacts

- **Database Issues**: DBA team
- **Edge Function Issues**: DevOps team  
- **Payment Issues**: Finance/Payment team
- **Monitoring**: SRE team

---

**Deployment Date**: 2025-09-04  
**Version**: 1.0.0  
**Next Review**: 2025-10-04
