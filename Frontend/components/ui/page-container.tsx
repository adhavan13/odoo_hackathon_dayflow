import React from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

export function PageContainer({ title, subtitle, badge, children, action }: PageContainerProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {badge && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-accent/15 text-accent border border-accent/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
      </div>

      {/* Main Content Body */}
      {children ? (
        children
      ) : (
        <div className="rounded-xl border border-border/80 bg-card p-8 text-center shadow-xs">
          <div className="mx-auto max-w-md space-y-3">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
              {title.charAt(0)}
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">
              This section is configured and ready for data integration and feature expansion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
