import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Site settings</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Manage company information shown on the public site.
      </p>
      <div className="border-border mt-6 flex flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Settings className="size-6" aria-hidden="true" />
        </span>
        <p className="text-foreground mt-4 text-sm font-medium">Nothing to configure yet</p>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm leading-relaxed">
          Company information, contact details, social links, and footer settings are not built yet.
        </p>
      </div>
    </div>
  );
}
