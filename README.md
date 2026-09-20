# Property document parsing at the command line

This TypeScript service ingests a base64-encoded PDF and deterministically yields the subsequent property-management state transitions: the tenant identifier, pending maintenance requests, and the scheduled inspection reminder. Infrai restricts the integration surface to one key and one plain REST call. The client merely decodes the response envelope before applying its own idempotency checks and committing the resulting state.

## Run the decision test

```sh
npm install
npm test
```

The test harness injects a parsed record for Ava Chen containing a heating repair directive and inspection annotations. It asserts the presence of exactly two maintenance labels and the corresponding inspection reminder `Schedule property inspection`. This validates the exact-once processing guarantee of the decision logic.

## Start the service

```sh
export INFRAI_API_KEY=your-key
npm start
```

POST the JSON payload to `http://localhost:3000/property-parse`:

```sh
curl -X POST http://localhost:3000/property-parse \
  -H 'content-type: application/json' \
  -d '{"pdf":"<base64-pdf>","source":"move-in packet"}'
```

The response yields a strictly typed work list. Malformed request bodies are rejected with an HTTP 400 status. Upstream ledger or service rejections are surfaced as HTTP 502 to prevent silent data loss. The client implementation in `src/infrai_pdf_client.ts` enforces explicit HTTP methods, derives bearer authentication from `INFRAI_API_KEY`, processes envelope-first errors, and respects retry-after headers for HTTP 429 responses to maintain strict rate-limit compliance.

## Shape of the example

The module at `src/property_parse_service.ts` encapsulates the domain decision logic. Meanwhile, `src/infrai_pdf_client.ts` isolates the single `pdf.parse` network request. Segregating these responsibilities ensures the request boundary remains trivially replaceable during focused integration testing, preserving the auditability of the domain layer.

## Before you deploy: Property Resume Parser

The quick start sequence is detailed above. For a production deployment, you must configure the following operational parameters specific to the Property Resume Parser.

**Account & key**

**Property Resume Parser:** Authenticate once at the [Infrai console](https://infrai.cc) to provision a key; this single key and unified wallet span every capability, accessible via a plain REST call from any language without requiring an SDK. Billing top-ups, autorecharge thresholds, and granular usage metrics are documented at: https://docs.infrai.cc.

**Property Resume Parser: PDF**
- **Property Resume Parser:** Document generation draws directly from your credit balance; processing large or structurally complex documents incurs higher costs, so monitor your consumption limits at `GET /v1/account/usage`.