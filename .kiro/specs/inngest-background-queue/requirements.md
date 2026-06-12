# Requirements Document

## Introduction

This feature integrates Inngest as a background job queue to decouple the post-payment pipeline from the Midtrans webhook handler. Currently, after a successful payment, the system synchronously generates an AI business plan, renders a PDF, uploads it to Cloudflare R2, and sends an email — all within a single serverless function invocation. This causes webhook timeouts, Vercel function timeout risks, and cascading failures. The new architecture dispatches an Inngest event upon payment success and processes the pipeline as independently retryable steps in the background.

## Glossary

- **Webhook_Handler**: The Next.js API route (`/api/midtrans/webhook`) that receives Midtrans payment notifications and responds with HTTP 200
- **Inngest_Client**: The configured Inngest SDK client instance used to send events and define background functions
- **Pipeline_Function**: The Inngest multi-step function that orchestrates AI generation, PDF rendering, R2 upload, and email delivery
- **Plan_Status**: The `PlanStatus` enum on the `BusinessPlan` model tracking progress through the pipeline (PAID → GENERATING → PDF_READY / FAILED)
- **Status_Endpoint**: The GET `/api/orders/[orderId]/check-status` route that reads current order and plan status from the database
- **Admin_Regenerate**: The POST `/api/pdf/generate/[planId]` route used by superadmins to trigger PDF regeneration
- **Inngest_Serve_Route**: The Next.js API route (`/api/inngest`) that serves the Inngest SDK and registers functions with the Inngest platform
- **Fallback_Mode**: A synchronous execution path used when Inngest is not configured (e.g., local development without Inngest Dev Server)

## Requirements

### Requirement 1: Inngest SDK Integration

**User Story:** As a developer, I want Inngest integrated into the Next.js application, so that background functions can be registered and triggered via events.

#### Acceptance Criteria

1. THE Inngest_Client SHALL be instantiated as a singleton module exporting both the client and a function-creation helper
2. THE Inngest_Serve_Route SHALL register all Pipeline_Functions with the Inngest platform via the `/api/inngest` route
3. WHEN the `INNGEST_EVENT_KEY` environment variable is not set, THE Inngest_Client SHALL operate in development mode connecting to the local Inngest Dev Server
4. THE Inngest_Client SHALL use the application identifier "bisnisapa-ai" for event routing

### Requirement 2: Webhook Decoupling

**User Story:** As a system operator, I want the Midtrans webhook to respond immediately after marking payment as successful, so that Midtrans does not timeout or retry unnecessarily.

#### Acceptance Criteria

1. WHEN the Webhook_Handler receives a valid payment success notification, THE Webhook_Handler SHALL update the order status to SUCCESS and the Plan_Status to PAID within the same database transaction
2. WHEN the order status is updated to SUCCESS, THE Webhook_Handler SHALL dispatch a `payment/success` event to the Inngest_Client containing the orderId, businessPlanId, and templateId
3. WHEN the event is dispatched, THE Webhook_Handler SHALL respond with HTTP 200 to Midtrans without waiting for pipeline completion
4. THE Webhook_Handler SHALL complete its response within 3 seconds of receiving the notification

### Requirement 3: Multi-Step Pipeline Function

**User Story:** As a system operator, I want the post-payment pipeline to execute as independently retryable steps, so that a failure in one step does not require re-executing previous successful steps.

#### Acceptance Criteria

1. WHEN the Pipeline_Function receives a `payment/success` event, THE Pipeline_Function SHALL execute Step 1: generate the AI business plan using the templateId from the event payload
2. WHEN Step 1 completes successfully, THE Pipeline_Function SHALL update the Plan_Status to GENERATING
3. WHEN Step 1 completes successfully, THE Pipeline_Function SHALL execute Step 2: render the PDF using @react-pdf/renderer
4. WHEN Step 2 completes successfully, THE Pipeline_Function SHALL execute Step 3: upload the PDF buffer to Cloudflare R2
5. WHEN Step 3 completes successfully, THE Pipeline_Function SHALL update the Plan_Status to PDF_READY and persist the PDF URL
6. WHEN Step 3 completes successfully, THE Pipeline_Function SHALL execute Step 4: send the PDF report email via Resend
7. IF any step fails after exhausting retries, THEN THE Pipeline_Function SHALL update the Plan_Status to FAILED and log the error

### Requirement 4: Step-Level Retry Configuration

**User Story:** As a system operator, I want each pipeline step to have its own retry policy, so that transient failures are handled gracefully without manual intervention.

#### Acceptance Criteria

1. THE Pipeline_Function SHALL configure Step 1 (AI generation) with a maximum of 3 retry attempts and exponential backoff
2. THE Pipeline_Function SHALL configure Step 2 (PDF rendering) with a maximum of 2 retry attempts
3. THE Pipeline_Function SHALL configure Step 3 (R2 upload) with a maximum of 3 retry attempts and exponential backoff
4. THE Pipeline_Function SHALL configure Step 4 (email delivery) with a maximum of 3 retry attempts and exponential backoff
5. WHEN a step fails and retries are exhausted, THE Pipeline_Function SHALL not retry subsequent steps

### Requirement 5: Status Polling Endpoint (Read-Only)

**User Story:** As a frontend developer, I want the check-status endpoint to only read the current status from the database, so that it does not trigger duplicate pipeline executions.

#### Acceptance Criteria

1. WHEN the Status_Endpoint receives a GET request, THE Status_Endpoint SHALL read the order and plan status from the database and return it
2. THE Status_Endpoint SHALL NOT trigger AI generation, PDF rendering, or any pipeline step
3. THE Status_Endpoint SHALL return the current Plan_Status value (PAID, GENERATING, PDF_READY, or FAILED) in the response
4. WHEN the Plan_Status is PDF_READY, THE Status_Endpoint SHALL include the PDF download URL in the response

### Requirement 6: Admin Regenerate via Inngest

**User Story:** As a superadmin, I want the "Regenerate PDF" action to dispatch via Inngest, so that it benefits from the same retry and monitoring capabilities as the initial generation.

#### Acceptance Criteria

1. WHEN the Admin_Regenerate endpoint receives a valid request, THE Admin_Regenerate endpoint SHALL dispatch a `pdf/regenerate` event to the Inngest_Client containing the planId and orderId
2. WHEN the Admin_Regenerate endpoint dispatches the event, THE Admin_Regenerate endpoint SHALL respond with HTTP 200 and a message indicating regeneration has been queued
3. WHEN the Pipeline_Function receives a `pdf/regenerate` event, THE Pipeline_Function SHALL execute Step 2 (PDF render), Step 3 (R2 upload), and Step 4 (email) without re-running Step 1 (AI generation)
4. THE Admin_Regenerate endpoint SHALL require superadmin authentication before dispatching the event

### Requirement 7: GENERATING Status in Database

**User Story:** As a developer, I want a GENERATING status in the plan lifecycle, so that the frontend can show appropriate progress indicators while the pipeline runs.

#### Acceptance Criteria

1. THE Plan_Status enum SHALL include a GENERATING value between PAID and PDF_READY
2. WHEN the Pipeline_Function begins processing, THE Pipeline_Function SHALL update the Plan_Status from PAID to GENERATING
3. WHEN the frontend polls the Status_Endpoint and receives GENERATING, THE frontend SHALL display a progress indicator to the user

### Requirement 8: Graceful Fallback for Development

**User Story:** As a developer, I want the system to fall back to synchronous execution when Inngest is not configured, so that local development works without running the Inngest Dev Server.

#### Acceptance Criteria

1. WHEN the `INNGEST_EVENT_KEY` environment variable is not set and the application is not in production mode, THE system SHALL execute the pipeline synchronously within the webhook handler
2. WHEN Fallback_Mode is active, THE system SHALL log a warning indicating that Inngest is not configured and synchronous mode is being used
3. WHEN the application is in production mode, THE system SHALL require Inngest configuration and refuse to fall back to synchronous execution
4. THE Fallback_Mode SHALL execute the same pipeline steps in the same order as the Pipeline_Function

### Requirement 9: Idempotent Event Processing

**User Story:** As a system operator, I want pipeline execution to be idempotent, so that duplicate webhook deliveries or event replays do not produce duplicate artifacts.

#### Acceptance Criteria

1. WHEN the Pipeline_Function receives an event for a plan that already has Plan_Status of PDF_READY, THE Pipeline_Function SHALL skip execution and return early
2. WHEN the Pipeline_Function receives an event for a plan that is currently GENERATING, THE Pipeline_Function SHALL skip execution to avoid concurrent processing
3. THE Webhook_Handler SHALL maintain its existing idempotency check for orders already in SUCCESS status with PDF_READY plans

### Requirement 10: Observability and Monitoring

**User Story:** As a system operator, I want visibility into pipeline execution status, so that I can diagnose failures and monitor throughput.

#### Acceptance Criteria

1. THE Pipeline_Function SHALL log the start and completion of each step with the planId and orderId
2. IF a step fails, THEN THE Pipeline_Function SHALL log the error details including step name, attempt number, and error message
3. THE Inngest dashboard SHALL be accessible for monitoring function execution history, success rates, and retry status
4. WHEN a pipeline execution fails permanently (retries exhausted), THE system SHALL create an audit log entry with action context
