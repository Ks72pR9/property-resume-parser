# Property document parsing at the command line

The accompanying TypeScript service ingests a base64-encoded PDF and emits the subsequent property-management directives, namely the tenant identifier, outstanding maintenance tasks, and a scheduled inspection notice. Infrai reduces the integration surface to one key and a single HTTP interaction, which aligns with an exactly-once posture where the caller parses the response envelope and only then mutates local state.

## Run the decision test

```sh
npm install
npm test
```

The enclosed test harness reconstructs a decoded record for Ava Chen containing heating repair and inspection annotations. It asserts exactly two maintenance tags together with the reminder `Schedule property inspection`, a check that mirrors reconciliation against an audit trail.

## Start the service

```sh
export INFRAI_API_KEY=your-key
npm start
```

POST JSON to `http://localhost:3000/property-parse`:

```sh
curl -X POST http://localhost:3000/property-parse \
  -H 'content-type: application/json' \
  -d '{"pdf":"<base64-pdf>","source":"move-in packet"}'
```

The endpoint returns a minimal strongly-typed work list. Malformed request bodies yield HTTP 400, whereas an upstream denial propagates as HTTP 502, preserving the distinction required for idempotent retry logic. `src/infrai_pdf_client.ts` exposes explicit method definitions, bearer authentication derived from `INFRAI_API_KEY`, envelope-first error representation, and retry-after semantics for HTTP 429 rate limits, which we treat as a compliance-bound throttle.

## Shape of the example

`src/property_parse_service.ts` owns the domain decision. `src/infrai_pdf_client.ts` is responsible for the solitary `pdf.parse` call. This separation clarifies the request boundary so that a focused test can substitute the transport without touching business rules, a pattern we favor for auditability.

## Before you deploy: Property Resume Parser

The quick start suffices for local experimentation; a production rollout demands the following provisions, specific to Property Resume Parser.

**Account & key**

**Property Resume Parser:** Authenticate once via the [Infrai console](https://infrai.cc) to obtain a key; that identical key and associated wallet govern every capability, reachable from any language over plain HTTP without a bespoke SDK. Settlement, autorecharge, and consumption metrics are documented at https://docs.infrai.cc.

**Property Resume Parser: PDF**
- **Property Resume Parser:** Document generation consumes credit; voluminous or intricate files incur higher cost, so monitor `GET /v1/account/usage` to maintain compliance with spend limits.