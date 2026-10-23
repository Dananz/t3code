import { EnvironmentId, RuntimeRequestId, ThreadId } from "@t3tools/contracts";
import { expect, it, vi } from "vite-plus/test";

vi.mock(import("../ChatMarkdown"), async (importOriginal) => ({
  ...(await importOriginal()),
  default: (({ text }: { text: string }) => <p>{text}</p>) as never,
}));

import { render } from "../../../test/render";
import { ComposerPendingUserInputPanel } from "./ComposerPendingUserInputPanel";

it("gives Hebrew question text its own direction without flipping the option rows", async () => {
  await using screen = await render(
    <ComposerPendingUserInputPanel
      pendingUserInputs={[
        {
          requestId: RuntimeRequestId.make("question-direction"),
          createdAt: "2026-10-23T00:00:00.000Z",
          dismissible: false,
          responseCapability: "live",
          questions: [
            {
              id: "question",
              header: "גישה",
              question: "איך לבצע את המיגרציה?",
              multiSelect: false,
              options: [
                {
                  label: "React Server Components בכל המסכים של האפליקציה",
                  description: "מסך אחד בכל פעם",
                },
              ],
            },
          ],
        },
      ]}
      cwd={undefined}
      threadRef={{ environmentId: EnvironmentId.make("env"), threadId: ThreadId.make("thread") }}
      respondingRequestIds={[]}
      answers={{}}
      questionIndex={0}
      onToggleOption={() => {}}
      onAdvance={() => {}}
      onDismiss={() => {}}
    />,
  );

  const dir = (text: string) =>
    screen.getByText(text, { exact: true }).element().getAttribute("dir");
  expect(dir("גישה")).toBe("rtl");
  expect(dir("React Server Components בכל המסכים של האפליקציה")).toBe("rtl");
  expect(dir("מסך אחד בכל פעם")).toBe("rtl");
  expect(
    screen
      .getByRole("button", { name: /React Server/ })
      .element()
      .getAttribute("dir"),
  ).toBeNull();
});
