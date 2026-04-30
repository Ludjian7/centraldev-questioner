import { createFileRoute } from "@tanstack/react-router";
import { Analyzer } from "@/components/analyzer/Analyzer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Business System Analyzer — Temukan sistem yang tepat untuk bisnis Anda",
      },
      {
        name: "description",
        content:
          "Asesmen 5 menit untuk memetakan kompleksitas operasional bisnis ritel Anda dan merekomendasikan tingkat sistem (Basic, Standard, Advanced) beserta estimasi investasinya.",
      },
      {
        property: "og:title",
        content: "Business System Analyzer",
      },
      {
        property: "og:description",
        content:
          "Asesmen singkat untuk merekomendasikan sistem yang paling tepat untuk skala bisnis Anda.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Analyzer />;
}
