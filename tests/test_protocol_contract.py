import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class ProtocolContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.main_js = (ROOT / "main.js").read_text(encoding="utf-8")
        cls.index_html = (ROOT / "index.html").read_text(encoding="utf-8")

    def test_protocol_has_seventeen_fixed_steps_and_expected_duration(self):
        match = re.search(
            r"const sequence = \[(.*?)\n\];",
            self.main_js,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(match, "Could not find the protocol sequence.")

        step_pattern = re.compile(
            r'\{ label: "([^"]+)", group: "([^"]+)", phase: "([^"]+)", '
            r'x: (\d+), y: (\d+), durationMs: (\d+) \}'
        )
        steps = step_pattern.findall(match.group(1))

        self.assertEqual(len(steps), 17)
        self.assertEqual(sum(int(step[5]) for step in steps), 21800)
        self.assertEqual(steps[0][1:5], ("Baseline fixation", "center", "50", "50"))
        self.assertEqual(steps[-1][1:5], ("Final fixation", "center", "50", "50"))

    def test_protocol_records_context_for_each_frame(self):
        required_fields = (
            "protocol_id: PROTOCOL_ID",
            "task_group: currentTask?.group",
            "task_phase: currentTask?.phase",
            "task_duration_target_ms: currentTask?.durationMs",
            "task_elapsed_ms:",
            "target_x_percent:",
            "target_y_percent:",
        )
        for field in required_fields:
            with self.subTest(field=field):
                self.assertIn(field, self.main_js)

    def test_bilingual_switch_and_persistent_preference_exist(self):
        self.assertIn('id="language-toggle"', self.index_html)
        self.assertIn('localStorage.getItem("starbsense-language")', self.main_js)
        self.assertIn('localStorage.setItem("starbsense-language", currentLanguage)', self.main_js)
        self.assertIn('languageToggle?.addEventListener("click"', self.main_js)
        self.assertIn('document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr"', self.main_js)

    def test_local_assistant_is_limited_and_non_diagnostic(self):
        self.assertIn('id="assistant-form"', self.index_html)
        self.assertIn("answerAssistantQuestion", self.main_js)
        self.assertIn("cannot confirm or exclude strabismus", self.main_js)
        self.assertIn("latestAnalysis", self.main_js)
        self.assertIn("updateCareGuidance", self.main_js)

    def test_generated_python_chart_titles_update_with_language(self):
        self.assertIn("heading.dataset.translationKey = alt", self.main_js)
        self.assertIn("image.dataset.translationKey = alt", self.main_js)
        self.assertIn('document.querySelectorAll("[data-translation-key]")', self.main_js)


if __name__ == "__main__":
    unittest.main()
