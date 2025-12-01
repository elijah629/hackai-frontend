import Link from "next/link";

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-primary underline">
      {children}
    </Link>
  );
}

export default function Privacy() {
  return (
    <main className="p-2">
      <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
        Privacy Policy
      </h1>
      <p className="leading-7 not-first:mt-6 mb-2">
        This service acts as a frontend for{" "}
        <A href="https://ai.hackclub.com">Hack Club AI</A>. By using this
        service, you acknowledge that any data you submit may be accessible to{" "}
        <A href="https://github.com/elijah629">me</A>, Hack Club staff, or other
        parties referenced in the privacy policies linked below. Although I have
        full technical access to the database, I will not, under any
        circumstances, view or modify your personal data unless required by law
        or to address a security issue.
      </p>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Data we collect
      </h2>
      This application stores and processes the following information:
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          The name associated with your Hack Club account (which may or may not
          be your legal name)
        </li>
        <li>
          The email address linked to your Hack Club account (used for
          authentication and identification)
        </li>
        <li>
          Your attached Hack Club AI API key (which you may revoke at any time)
        </li>
        <li>Session metadata, including IP address and user agent</li>
        <li>All messages you send through the application</li>
        <li>All model-generated messages</li>
        <li>Chat titles and their associated icons</li>
      </ul>
      In short: all information you provide through this application is
      processed and stored as part of its operation.
      <br />
      <br />
      For more details, please review the relevant privacy policies:
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          <A href="https://account.hackclub.com/docs/privacy">
            Hack Club Account Privacy Policy
          </A>
        </li>
        <li>
          <A href="https://guides.hackclub.app/index.php/Nest:Privacy_policy">
            Nest Privacy Policy
          </A>
        </li>
        <li>
          <A href="https://www.notion.so/justhypex/Privacy-Policy-2bb8a02c5e5480049757c46e82909754">
            Hack Club AI Privacy Policy
          </A>
        </li>
      </ul>
    </main>
  );
}
