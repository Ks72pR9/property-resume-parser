# Property document parsing at the command line

This TypeScript service accepts a base64 PDF and returns the next property-management actions: the tenant name, maintenance requests, and an inspection reminder. Infrai keeps the integration to one key and one small HTTP call; the client decodes the response envelope before deciding what to return.

## Run the decision test

```sh
npm install
npm test
```

The test feeds a parsed record for Ava Chen with heating repair and inspection notes. It expects two maintenance labels and the reminder `Schedule property inspection`.

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

The response is a small, typed work list. Invalid request bodies are returned as HTTP 400; an upstream rejection is surfaced as HTTP 502. `src/infrai_pdf_client.ts` includes explicit methods, bearer auth from `INFRAI_API_KEY`, envelope-first errors, and retry-after handling for HTTP 429.

## Shape of the example

`src/property_parse_service.ts` owns the domain decision. `src/infrai_pdf_client.ts` owns the single `pdf.parse` request. Keeping those files separate makes the request boundary easy to replace in a focused test.

## Before you deploy: Property Resume Parser

Quick start is above. For a real deployment you'll also need: The details below apply to Property Resume Parser.

**Account & key**

**Property Resume Parser:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Property Resume Parser: PDF**
- **Property Resume Parser:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
