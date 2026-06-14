/**
 * Shared renderers for Certifications, Languages, and Awards.
 * Templates import these helpers and pass their own style props,
 * keeping each template file free of repetitive section markup.
 */
import type { Certification, Language, Award } from '../types/cv';

export interface ExtraSectionStyles {
  sectionTitle: React.CSSProperties;
  itemRow?: React.CSSProperties;
  itemName: React.CSSProperties;
  itemMeta: React.CSSProperties;
  itemDesc?: React.CSSProperties;
}

export function CertificationsSection({
  certifications,
  styles,
  sectionKey = 'Certifications',
}: {
  certifications: Certification[];
  styles: ExtraSectionStyles;
  sectionKey?: string;
}) {
  if (!certifications || certifications.length === 0) return null;
  return (
    <section key={sectionKey} style={{ marginBottom: '24px' }}>
      <h2 style={styles.sectionTitle}>Certifications</h2>
      {certifications.map((cert) => (
        <div key={cert.id} style={{ marginBottom: '8px', ...(styles.itemRow ?? {}) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
            <span style={styles.itemName}>{cert.name}</span>
            {cert.issueDate && (
              <span style={styles.itemMeta}>
                {cert.issueDate}{cert.expiryDate ? ` – ${cert.expiryDate}` : ''}
              </span>
            )}
          </div>
          {cert.issuer && <div style={styles.itemMeta}>{cert.issuer}</div>}
        </div>
      ))}
    </section>
  );
}

export function LanguagesSection({
  languages,
  styles,
  inline = false,
}: {
  languages: Language[];
  styles: ExtraSectionStyles;
  inline?: boolean;
}) {
  if (!languages || languages.length === 0) return null;

  if (inline) {
    return (
      <section style={{ marginBottom: '24px' }}>
        <h2 style={styles.sectionTitle}>Languages</h2>
        <p style={styles.itemMeta}>
          {languages.map((l, i) => (
            <span key={l.id}>
              {i > 0 && ' · '}
              <span style={styles.itemName}>{l.name}</span>
              {l.proficiency && ` (${l.proficiency})`}
            </span>
          ))}
        </p>
      </section>
    );
  }

  return (
    <section style={{ marginBottom: '24px' }}>
      <h2 style={styles.sectionTitle}>Languages</h2>
      {languages.map((lang) => (
        <div key={lang.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '4px', ...(styles.itemRow ?? {}) }}>
          <span style={styles.itemName}>{lang.name}</span>
          {lang.proficiency && <span style={styles.itemMeta}>{lang.proficiency}</span>}
        </div>
      ))}
    </section>
  );
}

export function AwardsSection({
  awards,
  styles,
}: {
  awards: Award[];
  styles: ExtraSectionStyles;
}) {
  if (!awards || awards.length === 0) return null;
  return (
    <section style={{ marginBottom: '24px' }}>
      <h2 style={styles.sectionTitle}>Awards</h2>
      {awards.map((award) => (
        <div key={award.id} style={{ marginBottom: '8px', ...(styles.itemRow ?? {}) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
            <span style={styles.itemName}>{award.title}</span>
            {award.date && <span style={styles.itemMeta}>{award.date}</span>}
          </div>
          {award.issuer && <div style={styles.itemMeta}>{award.issuer}</div>}
          {award.description && <div style={styles.itemDesc ?? styles.itemMeta}>{award.description}</div>}
        </div>
      ))}
    </section>
  );
}
