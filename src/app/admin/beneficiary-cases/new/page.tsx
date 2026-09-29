import { getAdminCaseOptions } from "@/lib/support-a-future/case-workflow";
import { requireSupportAdmin } from "@/lib/support-a-future/security";
import CaseEditor from "../CaseEditor";

export const dynamic = "force-dynamic";

export default async function NewCasePage() {
  try {
    await requireSupportAdmin("cases.edit");
    const options = await getAdminCaseOptions();
    return <div className="space-y-8">
      <header>
        <a href="/admin/beneficiary-cases" className="inline-flex min-h-11 items-center text-text-link underline">Back to cases</a>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-text-primary">Create a private case draft</h1>
        <p className="mt-3 max-w-[620px] text-text-secondary">Nothing is published by saving this form. A different safeguarding reviewer must approve the saved revision before an authorized publisher can activate it.</p>
      </header>
      <CaseEditor options={options} permissions={{ edit: true, review: false, publish: false, withdraw: false }} />
    </div>;
  } catch {
    return <section role="alert" className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-text-primary">Draft editor unavailable</h1>
      <p className="text-text-secondary">Editing access or case options could not be verified. No draft has been created.</p>
      <a href="/admin/beneficiary-cases" className="inline-flex min-h-11 items-center text-text-link underline">Return to cases</a>
    </section>;
  }
}
