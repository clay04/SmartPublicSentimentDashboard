import hashlib
import json
import os

SEEN_FILE = "storage/seen_posts.json"


def load_seen():

    if not os.path.exists(SEEN_FILE):
        return set()

    try:

        with open(SEEN_FILE, "r") as f:

            content = f.read().strip()

            if not content:
                return set()

            return set(json.loads(content))

    except Exception:
        return set()


def save_seen(seen):

    with open(SEEN_FILE, "w") as f:
        json.dump(list(seen), f)


seen_posts = load_seen()


def is_duplicate(text: str):

    hash_id = hashlib.md5(text.encode()).hexdigest()

    if hash_id in seen_posts:
        return True

    seen_posts.add(hash_id)

    save_seen(seen_posts)

    return False