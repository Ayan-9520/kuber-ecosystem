export function ArchitectureDiagram() {
  return (
    <div className="api-architecture" role="img" aria-label="KuberOne API architecture diagram">
      <div className="api-arch-layer api-arch-clients">
        <span>Admin CRM</span>
        <span>Mobile Customer</span>
        <span>Mobile DSA</span>
        <span>Partner APIs</span>
      </div>
      <div className="api-arch-arrow">↓ HTTPS / JWT</div>
      <div className="api-arch-layer api-arch-gateway">
        <strong>API Gateway</strong>
        <span>Rate Limit · Auth · RBAC · Audit</span>
      </div>
      <div className="api-arch-arrow">↓</div>
      <div className="api-arch-layer api-arch-services">
        <span>CRM / LOS</span>
        <span>Communications</span>
        <span>AI Platform</span>
        <span>Analytics</span>
        <span>Governance</span>
      </div>
      <div className="api-arch-arrow">↓</div>
      <div className="api-arch-layer api-arch-data">
        <span>MySQL (Prisma)</span>
        <span>Redis Cache</span>
        <span>Object Storage</span>
        <span>Vector DB (RAG)</span>
      </div>
    </div>
  );
}
