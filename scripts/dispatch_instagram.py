# G:\projects\distributed-workflow\scripts\dispatch_instagram.py
"""
Distributed-Workflow - Autonomous Cloud Instagram Dispatcher
Executes precision dispatches for:
- Slot 1: DSA Ch 02 Reel (10:30 AM IST / 05:00 UTC)
- Slot 2: Solution Architecture Ch 01 Reel (12:00 PM IST / 06:30 UTC)
- Slot 3: DSA Ch 02 Carousel (02:00 PM IST / 08:30 UTC)
- Slot 4: Solution Architecture Ch 01 Carousel (03:00 PM IST / 09:30 UTC)
- Slot 5: System Design Ep 001 Reel (06:00 PM IST / 12:30 UTC)
- Slot 6: System Design Ep 001 Carousel (08:00 PM IST / 14:30 UTC)
"""

import os
import sys
import json
import time
import argparse
import datetime
import urllib.request
import urllib.parse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(SCRIPT_DIR, "slots_copywriting.json")

def post_json(url: str, data: dict, max_retries: int = 3):
    encoded = urllib.parse.urlencode(data).encode("utf-8")
    req = urllib.request.Request(url, data=encoded, method="POST")
    last_err = None
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            err_body = e.read().decode()
            print(f"[HTTP {e.code} Error (Attempt {attempt+1}/{max_retries})]: {err_body}")
            last_err = Exception(f"HTTP {e.code}: {err_body}")
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[Network Error (Attempt {attempt+1}/{max_retries})]: {e}")
            last_err = e
            time.sleep(2 ** attempt)
    raise last_err

def get_json(url: str, max_retries: int = 3):
    req = urllib.request.Request(url, method="GET")
    last_err = None
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            err_body = e.read().decode()
            print(f"[HTTP {e.code} Error (Attempt {attempt+1}/{max_retries})]: {err_body}")
            last_err = Exception(f"HTTP {e.code}: {err_body}")
            time.sleep(2 ** attempt)
        except Exception as e:
            print(f"[Network Error (Attempt {attempt+1}/{max_retries})]: {e}")
            last_err = e
            time.sleep(2 ** attempt)
    raise last_err

def publish_reel(access_token: str, ig_account_id: str, video_url: str, caption: str, poll_timeout: int = 180):
    print(f"🎬 [Cloud Dispatcher] Initiating Reel Ingestion: {video_url}")
    container_payload = {
        "media_type": "REELS",
        "video_url": video_url,
        "caption": caption,
        "share_to_feed": "true",
        "access_token": access_token
    }
    create_res = post_json(f"https://graph.facebook.com/v21.0/{ig_account_id}/media", container_payload)
    creation_id = create_res["id"]
    print(f"  Container created. ID: {creation_id}. Polling Meta encoding status...")

    start_time = time.time()
    while time.time() - start_time < poll_timeout:
        status_url = f"https://graph.facebook.com/v21.0/{creation_id}?fields=status_code,status&access_token={access_token}"
        status_res = get_json(status_url)
        code = status_res.get("status_code")
        print(f"  Meta Reel Encoding: {code} ({int(time.time() - start_time)}s)")
        if code == "FINISHED":
            break
        elif code == "ERROR":
            raise Exception(f"Meta server encoding failed: {status_res}")
        time.sleep(6)
    else:
        raise TimeoutError(f"Reel encoding timed out after {poll_timeout}s on Meta servers.")

    pub_payload = {
        "creation_id": creation_id,
        "access_token": access_token
    }
    publish_res = post_json(f"https://graph.facebook.com/v21.0/{ig_account_id}/media_publish", pub_payload)
    media_id = publish_res["id"]
    print(f"🎉 [SUCCESS] Instagram Reel Published Live! Media ID: {media_id}")
    return media_id

def publish_carousel(access_token: str, ig_account_id: str, image_urls: list, caption: str):
    print(f"📊 [Cloud Dispatcher] Initiating 5-Slide Carousel Upload ({len(image_urls)} slides)...")
    child_ids = []
    for idx, img_url in enumerate(image_urls, start=1):
        item_data = {
            "image_url": img_url,
            "is_carousel_item": "true",
            "access_token": access_token
        }
        res = post_json(f"https://graph.facebook.com/v21.0/{ig_account_id}/media", item_data)
        child_ids.append(res["id"])
        print(f"  Slide {idx}/5 container created: {res['id']}")
        time.sleep(1)

    carousel_payload = {
        "media_type": "CAROUSEL",
        "children": ",".join(child_ids),
        "caption": caption,
        "access_token": access_token
    }
    res_carousel = post_json(f"https://graph.facebook.com/v21.0/{ig_account_id}/media", carousel_payload)
    creation_id = res_carousel["id"]
    print(f"  Carousel container created: {creation_id}. Publishing...")

    pub_payload = {
        "creation_id": creation_id,
        "access_token": access_token
    }
    publish_res = post_json(f"https://graph.facebook.com/v21.0/{ig_account_id}/media_publish", pub_payload)
    media_id = publish_res["id"]
    print(f"🎉 [SUCCESS] Instagram Carousel Published Live! Media ID: {media_id}")
    return media_id

def resolve_auto_slot():
    """Resolves target slot based on current UTC hour and minute (IST = UTC + 5:30)."""
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    hour = now_utc.hour
    minute = now_utc.minute
    print(f"[Time Context] Current UTC: {now_utc.strftime('%H:%M:%S UTC')}")

    # 10:30 AM IST = 05:00 UTC (Window: 04:45 - 05:45 UTC)
    if (hour == 4 and minute >= 45) or (hour == 5 and minute <= 45):
        return "slot1"
    # 12:00 PM IST = 06:30 UTC (Window: 06:15 - 07:15 UTC)
    elif (hour == 6 and minute >= 15) or (hour == 7 and minute <= 15):
        return "slot2"
    # 02:00 PM IST = 08:30 UTC (Window: 08:15 - 09:15 UTC)
    elif (hour == 8 and minute >= 15) or (hour == 9 and minute <= 15):
        return "slot3"
    # 03:00 PM IST = 09:30 UTC (Window: 09:15 - 10:15 UTC)
    elif (hour == 9 and minute >= 15) or (hour == 10 and minute <= 15):
        return "slot4"
    # 06:00 PM IST = 12:30 UTC (Window: 12:15 - 13:15 UTC)
    elif (hour == 12 and minute >= 15) or (hour == 13 and minute <= 15):
        return "slot5"
    # 08:00 PM IST = 14:30 UTC (Window: 14:15 - 15:15 UTC)
    elif (hour == 14 and minute >= 15) or (hour == 15 and minute <= 15):
        return "slot6"
    else:
        print(f"[Notice] Current UTC time ({hour:02d}:{minute:02d}) does not fall inside a scheduled window. Defaulting to slot1.")
        return "slot1"

def main():
    parser = argparse.ArgumentParser(description="Cloud Instagram Scheduled Dispatcher")
    parser.add_argument("--slot", default="auto", choices=["slot1", "slot2", "slot3", "slot4", "slot5", "slot6", "auto"])
    parser.add_argument("--dry-run", action="store_true", help="Simulate without publishing to Meta")
    args = parser.parse_args()

    token = os.environ.get("META_ACCESS_TOKEN")
    ig_id = os.environ.get("IG_ACCOUNT_ID", "17841407910414880")

    # Local fallback for testing
    if not token:
        local_cred = r"C:\Users\Gunjan Jain\.gemini\config\credentials\instagram_credentials.json"
        if os.path.exists(local_cred):
            with open(local_cred, "r", encoding="utf-8") as f:
                c = json.load(f)
                token = c.get("access_token")
                ig_id = c.get("instagram_account_id", ig_id)

    if not token and not args.dry_run:
        print("❌ [FATAL] META_ACCESS_TOKEN environment variable is missing. Set it in GitHub Repository Secrets.")
        sys.exit(1)

    target_slot = args.slot if args.slot != "auto" else resolve_auto_slot()
    print(f"🎯 [Target Slot Selected]: {target_slot}")

    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        config = json.load(f)

    slot_data = config.get(target_slot)
    if not slot_data:
        print(f"❌ [Error] Slot {target_slot} not found in {CONFIG_FILE}")
        sys.exit(1)

    print(f"📋 Title: {slot_data.get('title')} ({slot_data.get('track')})")
    print(f"📌 Media Type: {slot_data.get('type')}")

    if args.dry_run:
        print("✅ [DRY RUN] Config verified successfully. No API dispatches were made.")
        sys.exit(0)

    if slot_data["type"] == "REEL":
        media_id = publish_reel(
            access_token=token,
            ig_account_id=ig_id,
            video_url=slot_data["video_url"],
            caption=slot_data["caption"]
        )
    elif slot_data["type"] == "CAROUSEL":
        media_id = publish_carousel(
            access_token=token,
            ig_account_id=ig_id,
            image_urls=slot_data["image_urls"],
            caption=slot_data["caption"]
        )
    else:
        raise ValueError(f"Unknown media type: {slot_data['type']}")

    print(f"\n🚀 [COMPLETED] Successfully processed {target_slot} -> Instagram Media ID: {media_id}\n")

if __name__ == "__main__":
    main()
