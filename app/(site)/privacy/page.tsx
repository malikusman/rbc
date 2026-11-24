import { Container } from "@/components/site";

export default function Privacy() {
  const s = [
    { h: "What we collect", p: "Your name, contact details, company details and the information you give us when you apply, book an event or contact us. For business members we also hold trade licence and ownership details needed for standard checks." },
    { h: "How we use it", p: "To run your membership and bookings, send invoices and receipts, keep you informed about Chamber activity you’ve opted into, and meet our legal obligations, including tax and anti-money-laundering checks." },
    { h: "Who we share it with", p: "Only the services that help us run the Chamber — such as our payment provider, accounting and e-invoicing provider, email and newsletter tools — under agreements that protect your data." },
    { h: "Your choices", p: "You can update your details and notification preferences in the member portal at any time, unsubscribe from the Weekly Update with one click, or ask us for a copy of your data or to delete it." },
  ];
  return (
    <Container className="pt-16">
      <div className="mx-auto max-w-[720px]">
        <div className="eyebrow mb-3 !text-red">Privacy notice</div>
        <h1 className="font-display text-[46px] leading-tight text-navy">How we look after your information.</h1>
        <p className="mt-4 text-[14px] text-faint">Draft for the demo — to be reviewed by the Chamber’s advisers.</p>
        <div className="mt-10 space-y-8 text-[17px] leading-[1.8] text-navy-2">
          {s.map((x) => (
            <section key={x.h}>
              <h2 className="font-display mb-2 text-[26px] text-navy">{x.h}</h2>
              <p>{x.p}</p>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
