import subprocess
import sys
import unittest
from pathlib import Path


class LinkCheckerTests(unittest.TestCase):
    def run_checker(self, *args):
        helper = Path(__file__).with_name("check-links.py")
        return subprocess.run(
            [sys.executable, str(helper), *args],
            cwd=helper.parent,
            capture_output=True,
            text=True,
            check=False,
        )

    def test_tracked_scope_is_nonempty_and_ignores_archived_inline_examples(self):
        result = self.run_checker("--tracked")
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertRegex(result.stdout, r"Checked [1-9]\d* documents and [1-9]\d* local")

    def test_empty_range_is_not_a_green_result(self):
        result = self.run_checker("--range", "HEAD..HEAD")
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn("No documents/local targets selected", result.stdout)


if __name__ == "__main__":
    unittest.main()
