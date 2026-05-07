import MailerWizard from './MailerWizard';

export default function LoginMailer() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Tempus Login Mailer</span>
        </h1>
        <p className="text-white/60">
          Excel laden → Vorlage wählen → personalisierte Outlook-Entwürfe direkt öffnen
        </p>
      </header>
      <MailerWizard />
    </div>
  );
}
