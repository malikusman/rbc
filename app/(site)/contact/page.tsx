"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Clock, Check } from "lucide-react";
import { motion } from "motion/react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { Container, PageHero } from "@/components/site";
import { useStore } from "@/lib/store";

export default function Contact() {
  const toast = useStore((s) => s.toast);
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHero eyebrow="Contact" title="Let us know if you’d like to be involved." intro="Membership, partnership, press or just a question — the team will reply within two working days." photo="dunes" />
      <Container className="mt-16">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-[28px] border border-hair bg-white p-8 shadow-[var(--shadow-card)] md:p-10">
            {sent ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-10 text-center">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-soft text-ok"><Check size={26} /></span>
                <h2 className="font-display mt-5 text-[30px] text-navy">Thank you — message received.</h2>
                <p className="mt-2 text-[15px] text-muted">It’s in the team’s CRM inbox. We’ll be in touch shortly.</p>
              </motion.div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  toast({ title: "Message sent", body: "Logged in the CRM and emailed to hello@britishchamberrak.net" });
                }}
                className="grid gap-5 sm:grid-cols-2"
              >
                <Field label="Full name"><Input required autoComplete="name" /></Field>
                <Field label="Company"><Input autoComplete="organization" /></Field>
                <Field label="Email"><Input required type="email" autoComplete="email" /></Field>
                <Field label="Phone"><Input type="tel" autoComplete="tel" placeholder="+971" /></Field>
                <Field label="I’m interested in" className="sm:col-span-2">
                  <Select defaultValue="Membership">
                    <option>Membership</option>
                    <option>Partnership or sponsorship</option>
                    <option>Speaking at an event</option>
                    <option>Press and media</option>
                    <option>Something else</option>
                  </Select>
                </Field>
                <Field label="Message" className="sm:col-span-2"><Textarea required rows={5} /></Field>
                <div className="sm:col-span-2">
                  <Button variant="primary" size="lg" type="submit">Send message</Button>
                </div>
              </form>
            )}
          </div>
          <div className="space-y-4">
            {[
              { i: MapPin, t: "Visit", b: "Level 12, RAK Business Centre, Al Nakheel, Ras Al Khaimah" },
              { i: Mail, t: "Email", b: "hello@britishchamberrak.net" },
              { i: Phone, t: "Call", b: "+971 7 204 1100" },
              { i: Clock, t: "Office hours", b: "Monday to Friday, 9:00–17:30" },
            ].map((x) => (
              <div key={x.t} className="flex gap-4 rounded-[22px] border border-hair bg-white p-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper text-navy"><x.i size={18} /></span>
                <div>
                  <div className="text-[13px] font-semibold text-copper-ink">{x.t}</div>
                  <div className="text-[15px] text-navy">{x.b}</div>
                </div>
              </div>
            ))}
            <p className="px-1 text-[12.5px] text-faint">Address and phone are placeholders for the demo.</p>
          </div>
        </div>
      </Container>
    </>
  );
}
