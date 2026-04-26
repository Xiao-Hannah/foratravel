import FirstQuoteWalkthrough from "./FirstQuoteWalkthrough";

export const metadata = {
  title: "First Quote Walkthrough · Fora Tools",
  description:
    "Walk through your very first quote — pick a partner, build the numbers, and see what you'll earn before you hit send.",
};

export default function Page() {
  return (
    // Local warm-cream background just for this tool, mirroring the original
    // first-booking-buddy aesthetic. The desktop layouts inside the steps own
    // their own widths, so we don't constrain to max-w-2xl here.
    <main className="bg-wtBg pb-12">
      <FirstQuoteWalkthrough />
    </main>
  );
}
