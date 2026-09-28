interface Resource {
  type: "github" | "paper" | "model" | "dataset" | "demo" | "link";
  title: string;
  description?: string;
  url: string;
}

interface ResourceGroup {
  type: string;
  title: string;
  description?: string;
  items: { name: string; url: string; metadata?: string }[];
}

interface ResourceCardProps {
  title?: string;
  description?: string;
  resources?: Resource[];
  groups?: ResourceGroup[];
  // One resource from string props, for MDX sources where array expressions are stripped.
  type?: Resource["type"];
  label?: string;
  url?: string;
}

const typeIcons: Record<string, string> = {
  github: "[Code]",
  paper: "[Paper]",
  model: "[Model]",
  dataset: "[Data]",
  demo: "[Demo]",
  link: "[Link]",
};

export function ResourceCard({ title, description, resources, groups, type, label, url }: ResourceCardProps) {
  const items = resources ?? (url ? [{ type: type ?? "link", title: label ?? url, url }] : undefined);
  return (
    <div
      style={{
        boxShadow: "0 0 0 2px currentColor",
        padding: "var(--space-md)",
        margin: "var(--space-lg) 0",
      }}
    >
      {title && (
        <h3 style={{ marginTop: 0, marginBottom: "var(--space-sm)", fontSize: "1.25rem" }}>{title}</h3>
      )}
      {description && (
        <p style={{ marginBottom: "var(--space-md)", opacity: 0.8, fontSize: "0.875rem" }}>
          {description}
        </p>
      )}

      {items && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
          {items.map((resource, i) => (
            <a
              key={i}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                padding: "var(--space-xs) var(--space-sm)",
                boxShadow: "0 0 0 1px currentColor",
                textDecoration: "none",
                fontSize: "0.875rem",
              }}
            >
              <span style={{ fontFamily: "var(--font-mono)" }}>{typeIcons[resource.type]}</span>
              <span>{resource.title}</span>
            </a>
          ))}
        </div>
      )}

      {groups?.map((group, i) => (
        <div key={i} style={{ marginTop: i > 0 ? "var(--space-md)" : 0 }}>
          <h4 style={{ fontSize: "1rem", marginBottom: "var(--space-sm)" }}>
            {typeIcons[group.type]} {group.title}
          </h4>
          {group.description && (
            <p style={{ fontSize: "0.875rem", opacity: 0.8, marginBottom: "var(--space-sm)" }}>
              {group.description}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-sm)" }}>
            {group.items.map((item, j) => (
              <a
                key={j}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "var(--space-xs) var(--space-sm)",
                  boxShadow: "0 0 0 1px currentColor",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                {item.name}
                {item.metadata && (
                  <span style={{ opacity: 0.6, marginLeft: "var(--space-xs)" }}>
                    ({item.metadata})
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
