# NotebookLM Full RPA Bot + Google Drive Upload
# Version: 7.0 Optimized
#
# Improvements vs v6:
# - All wait times significantly reduced (max_wait default 120 -> 25 min).
# - Aggressive polling for downloads (15s instead of 60s between attempts).
# - Robust visual style selection (English + Persian aliases, multiple fallbacks).
# - Whiteboard is selected reliably via name match before coordinate fallback.
# - cleanup_notebook() deletes the notebook (source + outputs) after each file
#   so the next file starts from a clean state.
# - Chrome tab is reused between batch items (no new tab per file).
# - Faster UI click cycle (sleep 1.2s -> 0.4s).
# - Source processing wait dropped (30s -> 12s), Drive upload wait (45s -> 15s).
#
# Required:
# python -m pip install uiautomation pyperclip -i https://pypi.org/simple --trusted-host pypi.org --trusted-host files.pythonhosted.org --no-cache-dir

import argparse
import ctypes
import ctypes.wintypes
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Iterable, Optional, Sequence

import pyperclip
import uiautomation as auto


NOTEBOOKLM_URL = "https://notebooklm.google.com/"
GOOGLE_DRIVE_URL = "https://drive.google.com/drive/my-drive"

DEFAULT_OUTPUT_DIR = Path.home() / "Downloads" / "NotebookLM_Outputs"
DEFAULT_DOWNLOADS_DIR = Path.home() / "Downloads"

AUDIO_EXTS = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".opus"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v"}


def log(message: str) -> None:
    print(message, flush=True)


def sleep(seconds: float) -> None:
    time.sleep(seconds)


def copy_paste(text: str) -> None:
    pyperclip.copy(text)
    sleep(0.1)
    auto.SendKeys("{Ctrl}v")


def open_chrome_new_tab(url: str) -> None:
    subprocess.Popen(["cmd", "/c", "start", "", "chrome", "--new-tab", url], shell=False)
    sleep(2.5)


def get_chrome_window(timeout: int = 15):
    deadline = time.time() + timeout

    while time.time() < deadline:
        try:
            chrome = auto.WindowControl(searchDepth=1, ClassName="Chrome_WidgetWin_1")
            if chrome.Exists(1):
                chrome.SetActive()
                sleep(0.3)
                return chrome
        except Exception:
            pass

        sleep(0.3)

    raise RuntimeError("Chrome window was not found.")


def activate_chrome(timeout: int = 15):
    chrome = get_chrome_window(timeout=timeout)
    chrome.SetActive()
    sleep(0.3)
    return chrome


def maximize_active_window() -> None:
    auto.SendKeys("{Alt}{Space}")
    sleep(0.1)
    auto.SendKeys("x")
    sleep(0.3)


def go_to_url(url: str, wait_seconds: float = 4) -> None:
    activate_chrome()
    auto.SendKeys("{Ctrl}l")
    sleep(0.1)
    copy_paste(url)
    auto.SendKeys("{Enter}")
    sleep(wait_seconds)


def active_window_rect() -> tuple[int, int, int, int]:
    hwnd = ctypes.windll.user32.GetForegroundWindow()
    rect = ctypes.wintypes.RECT()
    ctypes.windll.user32.GetWindowRect(hwnd, ctypes.byref(rect))
    return rect.left, rect.top, rect.right, rect.bottom


def click_xy(x: int, y: int) -> None:
    ctypes.windll.user32.SetCursorPos(int(x), int(y))
    sleep(0.1)
    ctypes.windll.user32.mouse_event(0x0002, 0, 0, 0, 0)
    sleep(0.03)
    ctypes.windll.user32.mouse_event(0x0004, 0, 0, 0, 0)
    sleep(0.4)


def click_relative(rx: float, ry: float, label: str = "") -> None:
    activate_chrome()
    left, top, right, bottom = active_window_rect()
    width = right - left
    height = bottom - top
    x = left + int(width * rx)
    y = top + int(height * ry)
    log(f"[FALLBACK] Coordinate click {label}: ({x}, {y})")
    click_xy(x, y)


def exact_regex(labels: Iterable[str]) -> str:
    escaped = [re.escape(x) for x in labels]
    return r"(?i)^\s*(" + "|".join(escaped) + r")\s*$"


def contains_regex(labels: Iterable[str]) -> str:
    escaped = [re.escape(x) for x in labels]
    return r"(?i)(" + "|".join(escaped) + r")"


def find_clickable(root, labels: Iterable[str], timeout: float = 8, exact: bool = True):
    pattern = exact_regex(labels) if exact else contains_regex(labels)
    deadline = time.time() + timeout

    while time.time() < deadline:
        for control_type in ("ButtonControl", "MenuItemControl", "HyperlinkControl", "ListItemControl", "Control"):
            try:
                finder = getattr(root, control_type)
                ctrl = finder(searchDepth=35, RegexName=pattern)
                if ctrl.Exists(0.3):
                    name = ctrl.Name or ""
                    if name.lower().startswith("created:"):
                        continue
                    return ctrl
            except Exception:
                pass

        sleep(0.25)

    return None


def click_label(root, labels: Iterable[str], timeout: float = 8, required: bool = False, exact: bool = True) -> bool:
    activate_chrome()
    root = get_chrome_window(timeout=3)

    ctrl = find_clickable(root, labels, timeout=timeout, exact=exact)

    if ctrl:
        try:
            log(f"[OK] Clicking: {ctrl.Name}")
            ctrl.Click(simulateMove=False)
            sleep(0.6)
            return True
        except Exception as exc:
            log(f"[WARN] Click failed for {ctrl.Name}: {exc}")

    if required:
        raise RuntimeError(f"Could not click: {list(labels)}")

    return False


def upload_one_file_via_dialog(file_path: Path) -> None:
    log("[INFO] Sending file path to dialog...")
    sleep(1.5)

    pyperclip.copy(str(file_path))
    sleep(0.15)
    auto.SendKeys("{Ctrl}v")
    sleep(0.3)
    auto.SendKeys("{Enter}")
    sleep(3)


def upload_many_files_via_dialog(paths: Sequence[Path]) -> None:
    log("[INFO] Sending multiple file paths to dialog...")
    sleep(1.5)

    text = " ".join(f'"{str(p)}"' for p in paths)
    pyperclip.copy(text)
    sleep(0.15)
    auto.SendKeys("{Ctrl}v")
    sleep(0.3)
    auto.SendKeys("{Enter}")
    sleep(3)


def snapshot_files(folder: Path) -> set[Path]:
    if not folder.exists():
        return set()
    return set(p for p in folder.iterdir() if p.is_file())


def is_temp_download(path: Path) -> bool:
    return path.suffix.lower() in {".crdownload", ".tmp", ".part"}


def wait_for_new_file(before: set[Path], exts: set[str], label: str, timeout_minutes: float) -> Path:
    deadline = time.time() + timeout_minutes * 60
    log(f"[INFO] Waiting for new {label} file in Downloads...")

    while time.time() < deadline:
        current = snapshot_files(DEFAULT_DOWNLOADS_DIR)
        new_files = [p for p in current if p not in before]
        candidates = [p for p in new_files if p.suffix.lower() in exts and not is_temp_download(p)]

        if candidates:
            newest = max(candidates, key=lambda p: p.stat().st_mtime)
            size1 = newest.stat().st_size
            sleep(1.5)
            size2 = newest.stat().st_size

            if size1 == size2 and size2 > 0:
                log(f"[OK] New {label} file detected: {newest}")
                return newest

        sleep(1)

    raise TimeoutError(f"No new {label} file in {timeout_minutes} minutes.")


def move_and_rename(downloaded: Path, output_dir: Path, output_stem: str, suffix_fallback: str) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)

    suffix = downloaded.suffix.lower() or suffix_fallback
    final_path = output_dir / f"{output_stem}{suffix}"

    if final_path.exists():
        final_path.unlink()

    shutil.move(str(downloaded), str(final_path))
    log(f"[OK] Saved: {final_path}")
    return final_path


# -----------------------------
# NotebookLM
# -----------------------------

def open_notebooklm(reuse_tab: bool = False) -> object:
    """
    Opens NotebookLM. If reuse_tab=True, navigates current tab instead of opening a new one.
    Used between batch items to avoid accumulating tabs.
    """
    if reuse_tab:
        log("[INFO] Navigating current tab to NotebookLM home...")
        go_to_url(NOTEBOOKLM_URL, wait_seconds=4)
    else:
        log("[INFO] Opening NotebookLM in a new Chrome tab...")
        open_chrome_new_tab(NOTEBOOKLM_URL)
        activate_chrome()
        maximize_active_window()
        go_to_url(NOTEBOOKLM_URL, wait_seconds=5)

    return get_chrome_window(timeout=8)


def create_new_notebook(root) -> None:
    log("[INFO] Creating new notebook...")

    clicked = click_label(
        root,
        ["Create new notebook", "Create new", "New notebook", "Create"],
        timeout=10,
        exact=True,
    )

    if not clicked:
        click_relative(0.855, 0.175, "Create new notebook")

    sleep(3)


def upload_source(root, source_file: Path) -> None:
    log("[INFO] Uploading source file...")

    clicked = click_label(
        root,
        ["Upload files", "Upload file"],
        timeout=10,
        exact=True,
    )

    if not clicked:
        click_relative(0.385, 0.625, "Upload files")

    upload_one_file_via_dialog(source_file)

    log("[INFO] Waiting for source processing...")
    sleep(12)

    activate_chrome()
    auto.SendKeys("{Esc}")
    sleep(1.5)
    activate_chrome()


def click_audio_overview(root) -> None:
    log("[INFO] Clicking Audio Overview...")

    clicked = click_label(
        root,
        ["Audio Overview"],
        timeout=8,
        exact=True,
    )

    if not clicked:
        click_relative(0.695, 0.245, "Audio Overview")

    sleep(1.5)


def click_video_overview(root) -> None:
    log("[INFO] Clicking Video Overview...")

    clicked = click_label(
        root,
        ["Video Overview"],
        timeout=8,
        exact=True,
    )

    if not clicked:
        click_relative(0.875, 0.245, "Video Overview")

    sleep(2)


def click_generate_if_needed(root, label: str) -> None:
    clicked = click_label(
        root,
        ["Generate", "Create", "Start", f"Generate {label}", f"Create {label}"],
        timeout=7,
        exact=True,
    )

    if clicked:
        log(f"[OK] {label} generation started.")
    else:
        log(f"[INFO] No Generate button for {label}. May have started automatically.")


def generate_audio(root) -> None:
    click_audio_overview(root)
    click_generate_if_needed(root, "audio")


def select_video_style(root, style_name: Optional[str]) -> None:
    """
    Selects the visual style in the Video Overview customization modal.
    PAYAPRESS default: Whiteboard. Supports English + Persian aliases.
    """
    if not style_name:
        style_name = "Whiteboard"

    log(f"[INFO] Selecting visual style: {style_name}")
    sleep(1.5)

    click_label(root, ["Customize", "Customize video"], timeout=2, exact=True)
    sleep(0.5)

    style_aliases = {
        "whiteboard": ["Whiteboard", "وایت‌برد", "وایت برد", "وایتبرد"],
        "classic": ["Classic", "کلاسیک"],
        "custom": ["Custom", "سفارشی"],
        "auto": ["Auto", "Auto-select", "Autoselect", "خودکار"],
        "kawaii": ["Kawaii", "کاوایی"],
    }

    normalized = style_name.strip().lower()
    aliases = style_aliases.get(normalized, [style_name])

    for attempt in range(2):
        if click_label(root, aliases, timeout=4, exact=True):
            log(f"[OK] Visual style '{style_name}' selected (exact match).")
            sleep(1)
            return
        sleep(0.4)

    if click_label(root, aliases, timeout=4, exact=False):
        log(f"[OK] Visual style '{style_name}' selected (partial match).")
        sleep(1)
        return

    log(f"[WARN] '{style_name}' not found by name. Using coordinate fallback.")
    coord_map = {
        "whiteboard": (0.535, 0.585),
        "classic": (0.455, 0.585),
        "custom": (0.380, 0.585),
        "auto": (0.305, 0.585),
        "kawaii": (0.625, 0.585),
    }

    rx, ry = coord_map.get(normalized, (0.535, 0.585))
    click_relative(rx, ry, f"{style_name} visual style")
    sleep(1)


def generate_video(root, language: Optional[str], video_format: Optional[str], visual_style: Optional[str]) -> None:
    click_video_overview(root)

    if video_format:
        log(f"[INFO] Selecting video format: {video_format}")
        click_label(root, ["Format"], timeout=3, exact=True)
        click_label(root, [video_format], timeout=4, exact=True)

    if language:
        log(f"[INFO] Selecting video language: {language}")
        click_label(root, ["Language", "Output language"], timeout=3, exact=True)
        click_label(root, [language], timeout=4, exact=True)

    select_video_style(root, visual_style or "Whiteboard")

    click_generate_if_needed(root, "video")


def try_download_audio(root) -> bool:
    activate_chrome()
    click_audio_overview(root)

    if click_label(root, ["Download audio", "Download"], timeout=4, exact=True):
        return True

    click_label(root, ["More", "More options", "Options", "Menu"], timeout=3, exact=True)
    sleep(0.6)

    return click_label(root, ["Download audio", "Download"], timeout=4, exact=True)


def try_download_video(root) -> bool:
    activate_chrome()
    click_video_overview(root)

    if click_label(root, ["Download video", "Download"], timeout=4, exact=True):
        return True

    click_label(root, ["More", "More options", "Options", "Menu"], timeout=3, exact=True)
    sleep(0.6)

    return click_label(root, ["Download video", "Download"], timeout=4, exact=True)


def wait_and_download_audio(root, output_dir: Path, output_stem: str, max_wait_minutes: float) -> Path:
    before = snapshot_files(DEFAULT_DOWNLOADS_DIR)
    deadline = time.time() + max_wait_minutes * 60
    attempt = 1

    while time.time() < deadline:
        log(f"[INFO] Audio download attempt {attempt}...")
        try:
            if try_download_audio(root):
                downloaded = wait_for_new_file(before, AUDIO_EXTS, "audio", timeout_minutes=8)
                return move_and_rename(downloaded, output_dir, output_stem, ".mp3")
        except Exception as exc:
            log(f"[WAIT] Audio not ready: {exc}")

        sleep(15)
        attempt += 1

    raise TimeoutError(f"Audio not downloadable in {max_wait_minutes} minutes.")


def wait_and_download_video(root, output_dir: Path, output_stem: str, max_wait_minutes: float) -> Path:
    before = snapshot_files(DEFAULT_DOWNLOADS_DIR)
    deadline = time.time() + max_wait_minutes * 60
    attempt = 1

    while time.time() < deadline:
        log(f"[INFO] Video download attempt {attempt}...")
        try:
            if try_download_video(root):
                downloaded = wait_for_new_file(before, VIDEO_EXTS, "video", timeout_minutes=15)
                return move_and_rename(downloaded, output_dir, output_stem, ".mp4")
        except Exception as exc:
            log(f"[WAIT] Video not ready: {exc}")

        sleep(20)
        attempt += 1

    raise TimeoutError(f"Video not downloadable in {max_wait_minutes} minutes.")


def cleanup_notebook(root) -> bool:
    """
    Deletes the just-created notebook (source + generated outputs) from NotebookLM
    so the next batch item starts from a clean state.
    Returns True on success, False if any step fails (non-fatal).
    """
    log("[INFO] Cleaning up notebook (delete source + outputs)...")

    try:
        go_to_url(NOTEBOOKLM_URL, wait_seconds=4)
        root = activate_chrome()
        sleep(2)

        clicked_menu = click_label(
            root,
            ["More actions", "More options", "Notebook actions"],
            timeout=5,
            exact=False,
        )

        if not clicked_menu:
            click_relative(0.25, 0.35, "Notebook 3-dot menu (most recent)")
            sleep(1)

        clicked_delete = click_label(
            root,
            ["Delete", "Remove", "حذف"],
            timeout=5,
            exact=True,
        )

        if not clicked_delete:
            log("[WARN] Delete option not found in menu.")
            auto.SendKeys("{Esc}")
            return False

        sleep(1.2)

        confirmed = click_label(
            root,
            ["Delete", "Confirm", "Yes", "OK", "حذف", "تأیید"],
            timeout=5,
            exact=True,
        )

        if confirmed:
            log("[OK] Notebook deleted successfully.")
            sleep(2)
            return True

        log("[WARN] Could not confirm deletion.")
        return False

    except Exception as exc:
        log(f"[WARN] Cleanup failed (non-fatal): {exc}")
        return False


# -----------------------------
# Google Drive
# -----------------------------

def upload_to_google_drive(paths: Sequence[Path], manual_folder: bool) -> None:
    log("[INFO] Opening Google Drive...")
    open_chrome_new_tab(GOOGLE_DRIVE_URL)
    sleep(1.5)
    go_to_url(GOOGLE_DRIVE_URL, wait_seconds=5)
    root = get_chrome_window(timeout=8)

    if manual_folder:
        log("[ACTION] Open the destination folder in Google Drive.")
        input("[ACTION] After the folder is visible, press ENTER...")

    log("[INFO] Clicking Drive New...")
    if not click_label(root, ["New", "جدید", "نو"], timeout=8, exact=True):
        click_relative(0.055, 0.155, "Drive New")

    log("[INFO] Clicking File upload...")
    if not click_label(
        root,
        ["File upload", "Upload file", "بارگذاری فایل", "آپلود فایل"],
        timeout=8,
        exact=True,
    ):
        click_relative(0.105, 0.315, "File upload")

    upload_many_files_via_dialog(paths)
    log("[INFO] Drive upload started. Waiting...")
    sleep(15)
    log("[OK] Drive upload step completed/started.")


# -----------------------------
# Main
# -----------------------------

def run_bot(
    source_file: Path,
    output_dir: Path,
    language: Optional[str],
    video_format: Optional[str],
    visual_style: Optional[str],
    max_wait: float,
    upload_drive: bool,
    manual_drive_folder: bool,
    cleanup: bool,
    reuse_chrome: bool,
):
    if not source_file.exists():
        raise FileNotFoundError(f"Input file does not exist: {source_file}")

    if source_file.suffix.lower() not in {".docx", ".txt", ".pdf", ".md", ".pptx"}:
        raise ValueError("Unsupported file type. Use .docx, .txt, .pdf, .md, or .pptx")

    output_stem = source_file.stem
    output_dir.mkdir(parents=True, exist_ok=True)

    root = open_notebooklm(reuse_tab=reuse_chrome)
    create_new_notebook(root)
    upload_source(root, source_file)

    root = activate_chrome()

    generate_audio(root)
    sleep(2)
    generate_video(root, language=language, video_format=video_format, visual_style=visual_style)

    log("[INFO] Waiting for generated outputs to become downloadable...")

    audio_path = wait_and_download_audio(root, output_dir, output_stem, max_wait_minutes=max_wait)
    video_path = wait_and_download_video(root, output_dir, output_stem, max_wait_minutes=max_wait)

    if upload_drive:
        upload_to_google_drive([audio_path, video_path], manual_folder=manual_drive_folder)

    if cleanup:
        cleanup_notebook(root)

    log("[DONE] File completed.")
    log(f"[DONE] Audio: {audio_path}")
    log(f"[DONE] Video: {video_path}")


def collect_input_files(args) -> list[Path]:
    """
    Collects input files from:
    1) direct command-line file paths
    2) --file-list text file, one path per line
    3) --folder directory scan
    """
    allowed = {".docx", ".txt", ".pdf", ".md", ".pptx"}
    collected: list[Path] = []

    for item in args.files or []:
        collected.append(Path(item).expanduser().resolve())

    if args.file_list:
        list_path = Path(args.file_list).expanduser().resolve()
        if not list_path.exists():
            raise FileNotFoundError(f"File list does not exist: {list_path}")

        for raw in list_path.read_text(encoding="utf-8-sig").splitlines():
            line = raw.strip().strip('"')
            if not line or line.startswith("#"):
                continue
            collected.append(Path(line).expanduser().resolve())

    if args.folder:
        folder = Path(args.folder).expanduser().resolve()
        if not folder.exists():
            raise FileNotFoundError(f"Folder does not exist: {folder}")

        if args.recursive:
            files = [p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in allowed]
        else:
            files = [p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in allowed]

        collected.extend(sorted(files, key=lambda p: p.name.lower()))

    seen = set()
    unique: list[Path] = []
    for p in collected:
        key = str(p).lower()
        if key not in seen:
            seen.add(key)
            unique.append(p)

    if args.limit and args.limit > 0:
        unique = unique[: args.limit]

    if not unique:
        raise ValueError("No input files provided. Provide file paths, --file-list, or --folder.")

    return unique


def run_batch(
    source_files: list[Path],
    output_dir: Path,
    language: Optional[str],
    video_format: Optional[str],
    visual_style: Optional[str],
    max_wait: float,
    upload_drive: bool,
    manual_drive_folder: bool,
    continue_on_error: bool,
    cleanup: bool,
):
    """
    Processes files one by one (sequential by design - one NotebookLM tab at a time).
    Chrome tab is reused across files; cleanup_notebook resets state between items.
    """
    log(f"[BATCH] Total files queued: {len(source_files)}")

    completed: list[tuple[Path, str]] = []
    failed: list[tuple[Path, str]] = []

    for index, source_file in enumerate(source_files, start=1):
        log("")
        log("=" * 80)
        log(f"[BATCH] Starting {index}/{len(source_files)}: {source_file}")
        log("=" * 80)

        try:
            run_bot(
                source_file=source_file,
                output_dir=output_dir,
                language=language,
                video_format=video_format,
                visual_style=visual_style,
                max_wait=max_wait,
                upload_drive=upload_drive,
                manual_drive_folder=manual_drive_folder,
                cleanup=cleanup,
                reuse_chrome=(index > 1),
            )
            completed.append((source_file, "completed"))
            log(f"[BATCH] Completed {index}/{len(source_files)}: {source_file.name}")

        except Exception as exc:
            message = str(exc)
            failed.append((source_file, message))
            log(f"[ERROR] Failed on file: {source_file}")
            log(f"[ERROR] Reason: {message}")

            if not continue_on_error:
                log("[BATCH] Stopped (use --continue-on-error to keep going).")
                break

            log("[BATCH] Continuing to next file...")
            sleep(3)

    log("")
    log("=" * 80)
    log("[BATCH] Summary")
    log("=" * 80)

    log(f"Completed: {len(completed)}")
    for p, _ in completed:
        log(f"  OK  - {p}")

    log(f"Failed: {len(failed)}")
    for p, reason in failed:
        log(f"  ERR - {p} | {reason}")


def test_mode():
    open_notebooklm(reuse_tab=False)
    log("[OK] NotebookLM opened in normal Chrome.")


def main():
    parser = argparse.ArgumentParser(description="NotebookLM RPA bot v7 (optimized) using normal logged-in Chrome.")
    parser.add_argument("files", nargs="*", help="One or more input files: .docx/.txt/.pdf/.md/.pptx")
    parser.add_argument("--out", default=str(DEFAULT_OUTPUT_DIR), help="Output folder for audio/video files.")
    parser.add_argument("--file-list", default=None, help="Optional .txt file with one input path per line.")
    parser.add_argument("--folder", default=None, help="Optional folder containing input documents to process.")
    parser.add_argument("--recursive", action="store_true", help="Scan --folder recursively.")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of files. 0 = no limit.")
    parser.add_argument("--continue-on-error", action="store_true", help="Continue batch if one file fails.")
    parser.add_argument("--language", default=None, help="Optional output language, e.g. English, Persian.")
    parser.add_argument("--format", default=None, help="Optional video format if visible.")
    parser.add_argument("--style", default="Whiteboard", help="Video visual style. Default: Whiteboard.")
    parser.add_argument("--max-wait", type=float, default=25, help="Max minutes per output. Default: 25.")
    parser.add_argument("--upload-drive", action="store_true", help="Upload final audio/video to Google Drive.")
    parser.add_argument("--manual-drive-folder", action="store_true", help="Pick Drive folder manually.")
    parser.add_argument("--no-cleanup", action="store_true", help="Do NOT delete the notebook after processing.")
    parser.add_argument("--test", action="store_true", help="Only open NotebookLM and stop.")

    args = parser.parse_args()

    if args.test:
        test_mode()
        return

    try:
        source_files = collect_input_files(args)
    except Exception as exc:
        print(f"Error: {exc}")
        print("Provide one or more file paths, or use --file-list, or use --folder.")
        sys.exit(1)

    run_batch(
        source_files=source_files,
        output_dir=Path(args.out).expanduser().resolve(),
        language=args.language,
        video_format=args.format,
        visual_style=args.style,
        max_wait=args.max_wait,
        upload_drive=args.upload_drive,
        manual_drive_folder=args.manual_drive_folder,
        continue_on_error=args.continue_on_error,
        cleanup=not args.no_cleanup,
    )


if __name__ == "__main__":
    main()
