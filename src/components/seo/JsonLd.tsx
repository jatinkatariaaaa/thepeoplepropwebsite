/**
 * Renders a JSON-LD structured-data block. Server-component friendly.
 * Pass one schema object or an array of schema objects.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <>
      {json.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Structured data is trusted, server-generated content.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
