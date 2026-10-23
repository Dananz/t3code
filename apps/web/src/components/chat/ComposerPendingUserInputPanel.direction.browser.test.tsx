import { EnvironmentId, RuntimeRequestId, ThreadId } from "@t3tools/contracts";
import { expect, it, vi } from "vite-plus/test";

vi.mock(import("../ChatMarkdown"), async (importOriginal) => ({
  ...(await importOriginal()),
  default: (({ text }: { text: string }) => <p>{text}</p>) as never,
}));

import { render } from "../../../test/render";
import { ComposerPendingUserInputPanel } from "./ComposerPendingUserInputPanel";

const threadRef = { environmentId: EnvironmentId.make("env"), threadId: ThreadId.make("thread") };

function renderQuestion(question: {
  header: string;
  question: string;
  options: { label: string; description: string }[];
}) {
  return render(
    <ComposerPendingUserInputPanel
      pendingUserInputs={[
        {
          requestId: RuntimeRequestId.make("question-direction"),
          createdAt: "2026-10-23T00:00:00.000Z",
          dismissible: false,
          responseCapability: "live",
          questions: [{ id: "question", multiSelect: false, ...question }],
        },
      ]}
      cwd={undefined}
      threadRef={threadRef}
      respondingRequestIds={[]}
      answers={{}}
      questionIndex={0}
      onToggleOption={() => {}}
      onAdvance={() => {}}
      onDismiss={() => {}}
    />,
  );
}

it("lays out Hebrew header and options right to left, even when they open with an English term", async () => {
  await using screen = await renderQuestion({
    header: "גישה",
    question: "איך לבצע את המיגרציה?",
    options: [
      { label: "React Server Components בכל המסכים של האפליקציה", description: "מסך אחד בכל פעם" },
      { label: "Incremental", description: "One module at a time" },
    ],
  });

  expect(screen.getByText("גישה").element().getAttribute("dir")).toBe("rtl");
  const hebrewOption = screen.getByRole("button", { name: /React Server Components/ }).element();
  const englishOption = screen.getByRole("button", { name: /Incremental/ }).element();
  expect(hebrewOption.getAttribute("dir")).toBe("rtl");
  expect(englishOption.getAttribute("dir")).toBe("ltr");
});
