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

it("sets the direction of Hebrew header and option text, even when it opens with an English term, and leaves the rows left to right", async () => {
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
  expect(hebrewOption.getAttribute("dir")).toBeNull();
  const direction = (text: string) =>
    screen.getByText(text, { exact: true }).element().getAttribute("dir");
  expect(direction("React Server Components בכל המסכים של האפליקציה")).toBe("rtl");
  expect(direction("מסך אחד בכל פעם")).toBe("rtl");
  expect(direction("Incremental")).toBe("ltr");
  expect(direction("One module at a time")).toBe("ltr");
});
